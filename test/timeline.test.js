/* eslint-env node, mocha */
'use strict'

const timelinePlugin = require('../timeline')

const assert = require('assert')
const nock = require('nock')
const Fastify = require('fastify')
const fp = require('fastify-plugin')

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
}

let fastify
describe('timeline', () => {
  before('create fastify instance', (done) => {
    fastify = Fastify({ logger: { level: 'silent' } })
    fastify.register(fp(fakeUserClient))
      .register(fp(fakeTweetClient))
      .register(fp(fakeFollowClient))
      .register(timelinePlugin)
      .ready(done)
  })
  before(() => nock.disableNetConnect())
  after(() => nock.enableNetConnect())

  after('destroy fastify', done => {
    if (!fastify) return done()
    fastify.close(done)
  })

  it('get timeline', async () => {
    const USER_ID = 'the-user-id'
    const USERNAME = 'the-user-1'
    const JSON_WEB_TOKEN = 'the-json-web-token'

    const USER_ID_1 = 'the-user-id-1'
    const USER_ID_2 = 'the-user-id-2'
    const USER_ID_3 = 'the-user-id-3'

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

    getMeReturn = [
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
    assert.equal(200, res.statusCode, res.payload)

    const body = JSON.parse(res.payload)

    assert.equal(body.length, 4, res.payload)
    assert.deepEqual(body, followingTweets)
  })
})
