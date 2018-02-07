/* eslint-env node, mocha */
'use strict'

const timelinePlugin = require('../timeline')
const { ObjectId } = require('mongodb')

const nock = require('nock')
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const t = require('tap')

const USER_ID = new ObjectId()

let userPrehandler = []
async function injectUser (fastify) {
  fastify.addHook('preHandler', async function (req, reply) {
    req.user = userPrehandler.shift()
  })
}

let getFollowArguments = []
let getFollowReturn = []
async function fakeFollowClient (fastify) {
  fastify.decorate('followClient', {
    getMyFollowing: function (req) {
      getFollowArguments.push(req)
      return getFollowReturn.shift()
    }
  })
}

let getTweetArguments = []
let getTweetReturn = []
async function fakeTweetClient (fastify) {
  fastify.decorate('tweetClient', {
    getTweets: function (req) {
      getTweetArguments.push(req)
      return getTweetReturn.shift()
    }
  })
  fastify.decorate('transformStringIntoObjectId', ObjectId)
  fastify.decorate('getUserIdFromRequest', () => USER_ID)
}

t.test('timeline', async t => {
  const fastify = Fastify({ logger: { level: 'silent' } })
  fastify
    .register(fp(injectUser))
    .register(fp(fakeTweetClient))
    .register(fp(fakeFollowClient))
    .register(timelinePlugin)

  nock.disableNetConnect()
  t.tearDown(() => nock.enableNetConnect())

  t.plan(1)

  t.test('get timeline', async t => {
    t.plan(3)

    const USERNAME = 'the-user-1'
    const JSON_WEB_TOKEN = 'the-json-web-token'

    const USER_ID_1 = new ObjectId()
    const USER_ID_2 = new ObjectId()
    const USER_ID_3 = new ObjectId()

    const followingTweets = [
      {
        text: 'tweet user id 1',
        user: { _id: USER_ID_1 }
      },
      {
        text: 'tweet user id 2',
        user: { _id: USER_ID_2 }
      },
      {
        text: 'tweet user id 3',
        user: { _id: USER_ID_3 }
      },
      {
        text: ' another tweet user id 1',
        user: { _id: USER_ID_1 }
      }
    ]

    userPrehandler = [
      { _id: USER_ID, username: USERNAME }
    ]
    getFollowReturn = [
      [ USER_ID_1, USER_ID_2, USER_ID_3 ]
    ]
    getTweetReturn = [
      followingTweets
    ]

    const res = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    t.equal(200, res.statusCode, res.payload)

    const body = JSON.parse(res.payload)

    t.equal(body.length, 4, res.payload)
    t.deepEqual(body, JSON.parse(JSON.stringify(followingTweets)))
  })
})
