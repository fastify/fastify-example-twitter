/* eslint-env node, mocha */
'use strict'

const tweetPlugin = require('../index')

const assert = require('assert')
const nock = require('nock')
const MongoClient = require('mongodb').MongoClient
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const makeRequest = (fastify, options) => new Promise((resolve) => fastify.inject(options, resolve))

const configuration = {
  TWEET_MONGO_URL: 'mongodb://localhost/tweet'
}

let fastify
describe('tweet', () => {
  before('drop mongo', () => {
    return MongoClient.connect(configuration.TWEET_MONGO_URL)
      .then(mongoClient => {
        mongoClient.unref()
        return mongoClient.dropDatabase()
      })
  })
  before('create fastify instance', (done) => {
    fastify = Fastify({ level: 'silent' })
    fastify.register(fp(tweetPlugin), configuration)
    fastify.ready(done)
  })
  before(() => nock.disableNetConnect())
  after(() => nock.enableNetConnect())

  after('destroy fastify', done => {
    if (!fastify) return done()
    fastify.close(done)
  })

  it('add a tweet + get tweets', () => {
    const USER_ID = 'the-user-id'
    const USERNAME = 'the-user-1'
    const TWEET_TEXT = 'the tweet text!'
    const JSON_WEB_TOKEN = 'the-json-web-token'

    const getMeNockScope = nock('http://localhost:3001')
      .replyContentLength()
      .get('/api/user/me')
      .twice()
      .reply(200, {
        _id: USER_ID,
        username: USERNAME
      })

    return makeRequest(fastify, {
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
      .then(res => {
        assert.equal(204, res.statusCode, res.payload)
      })
      .then(() => {
        return makeRequest(fastify, {
          method: 'GET',
          url: '/',
          headers: {
            'Authorization': 'Bearer ' + JSON_WEB_TOKEN
          }
        })
          .then(res => {
            assert.equal(200, res.statusCode, res.payload)

            const body = JSON.parse(res.payload)

            assert.equal(1, body.length, res.payload)
            assert.ok(body[0]._id)
            assert.deepEqual(body[0].user, {
              _id: USER_ID,
              username: USERNAME
            })
            assert.deepEqual(body[0].text, TWEET_TEXT)

            getMeNockScope.done()
          })
      })
  })
})
