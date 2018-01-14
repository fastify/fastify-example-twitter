/* eslint-env node, mocha */
'use strict'

const tweetPlugin = require('../tweet')

const assert = require('assert')
const nock = require('nock')
const { MongoClient } = require('mongodb')
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const MONGODB_URL = 'mongodb://localhost/test'

let getMeArguments = []
let getMeReturn = []
async function fakeUserClient (fastify) {
  fastify.decorate('userClient', {
    getMe: function (req) {
      getMeArguments.push(req)
      return getMeReturn.shift()
    }
  })
}

let fastify
describe('tweet', () => {
  before('drop mongo', () => {
    return MongoClient.connect(MONGODB_URL)
      .then(mongoClient => {
        mongoClient.unref()
        return mongoClient.dropDatabase()
      })
  })
  before('create fastify instance', (done) => {
    fastify = Fastify({ logger: { level: 'silent' } })
    fastify.register(require('fastify-mongodb'), { url: MONGODB_URL })
      .register(fp(fakeUserClient))
      .register(tweetPlugin)
      .ready(done)
  })
  before(() => nock.disableNetConnect())
  after(() => nock.enableNetConnect())

  beforeEach(() => { getMeArguments = [] })

  after('destroy fastify', done => {
    if (!fastify) return done()
    fastify.close(done)
  })

  it('add a tweet + get tweets', async () => {
    const USER_ID = '59cfce2748c1f7eb59490b0a'
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
    assert.equal(res.statusCode, 204, res.payload)

    res = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(res.statusCode, 200, res.payload)

    const myTweetBody = JSON.parse(res.payload)

    assert.equal(myTweetBody.length, 1, res.payload)
    assert.ok(myTweetBody[0]._id)
    assert.deepEqual(myTweetBody[0].user, {
      _id: USER_ID,
      username: USERNAME
    })
    assert.deepEqual(myTweetBody[0].text, TWEET_TEXT)

    res = await fastify.inject({
      method: 'GET',
      url: '/' + USER_ID,
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(res.statusCode, 200, res.payload)
    const userTweetBody = JSON.parse(res.payload)
    assert.deepEqual(userTweetBody, myTweetBody)

    assert.equal(getMeArguments.length, 3)
  })
})
