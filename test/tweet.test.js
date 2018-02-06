/* eslint-env node, mocha */
'use strict'

const tweetPlugin = require('../tweet')

const nock = require('nock')
const { MongoClient, ObjectId } = require('mongodb')
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const t = require('tap')

const MONGODB_URL = 'mongodb://localhost/test'

const USER_ID = new ObjectId('59cfce2748c1f7eb59490b0a')

let getMeArguments = []
let getMeReturn = []
async function fakeUserClient (fastify) {
  fastify.decorate('userClient', {
    getMe: function (req) {
      getMeArguments.push(req)
      return getMeReturn.shift()
    }
  })
  fastify.decorate('transformStringIntoObjectId', fastify.mongo.ObjectId)
  fastify.decorate('getUserIdFromRequest', () => USER_ID)
}

t.test('tweet', async t => {
  const mongoClient = await MongoClient.connect(MONGODB_URL)
  await mongoClient.db('test').dropDatabase()
  t.tearDown(() => mongoClient.close())

  const fastify = Fastify({ logger: { level: 'silent' } })
  fastify.register(require('fastify-mongodb'), { url: MONGODB_URL })
    .register(fp(fakeUserClient))
    .register(tweetPlugin)
  t.tearDown(() => fastify.close())

  nock.disableNetConnect()
  t.tearDown(() => nock.enableNetConnect())

  t.plan(1)

  t.test('add a tweet + get tweets', async t => {
    t.plan(9)
    getMeArguments = []

    const USERNAME = 'the-user-1'
    const TWEET_TEXT = 'the tweet text!'
    const JSON_WEB_TOKEN = 'the-json-web-token'

    // getMeReturn is used to mock the `/me` request
    // I don't like this! If you ate it please PR!!
    getMeReturn = [
      { _id: USER_ID, username: USERNAME },
      { _id: USER_ID, username: USERNAME },
      { _id: USER_ID, username: USERNAME }
    ]

    let res = await fastify.inject({
      method: 'POST',
      url: '/',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      },
      payload: JSON.stringify({
        text: TWEET_TEXT
      })
    })
    t.equal(res.statusCode, 204, res.payload)

    res = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    t.equal(res.statusCode, 200, res.payload)

    const myTweetBody = JSON.parse(res.payload)

    t.equal(myTweetBody.length, 1, res.payload)
    t.ok(myTweetBody[0]._id)
    t.deepEqual(myTweetBody[0].user, {
      _id: USER_ID + '',
      username: USERNAME
    })
    t.deepEqual(myTweetBody[0].text, TWEET_TEXT)

    res = await fastify.inject({
      method: 'GET',
      url: '/' + USER_ID,
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    t.equal(res.statusCode, 200, res.payload)
    const userTweetBody = JSON.parse(res.payload)
    t.deepEqual(userTweetBody, myTweetBody)

    t.equal(getMeArguments.length, 3)
  })
})
