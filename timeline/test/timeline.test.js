/* eslint-env node, mocha */
'use strict'

const timelinePlugin = require('../index')

const assert = require('assert')
const nock = require('nock')
const MongoClient = require('mongodb').MongoClient
const Fastify = require('fastify')

const makeRequest = (fastify, options) => new Promise((resolve) => fastify.inject(options, resolve))

const configuration = {
  TWEET_MONGO_URL: 'mongodb://localhost/tweet'
}

let fastify
describe('timeline', () => {
  before('drop mongo', () => {
    return MongoClient.connect(configuration.TWEET_MONGO_URL)
      .then(mongoClient => {
        mongoClient.unref()
        return mongoClient.dropDatabase()
      })
  })
  before('create fastify instance', (done) => {
    fastify = Fastify({ level: 'silent' })
    fastify.register(timelinePlugin, configuration)
    fastify.ready(done)
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

    const getMeNockScope = nock('http://localhost:3001')
      .replyContentLength()
      .get('/api/user/me')
      .reply(200, {
        _id: USER_ID,
        username: USERNAME
      })
      .get('/api/follow/following/' + USER_ID)
      .reply(200, [
        USER_ID_1,
        USER_ID_2,
        USER_ID_3
      ])
      .get('/api/tweet/' + [ USER_ID_1, USER_ID_2, USER_ID_3, USER_ID ].join(','))
      .reply(200, followingTweets)

    const res = await makeRequest(fastify, {
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

    getMeNockScope.done()
  })
})
