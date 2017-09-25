/* eslint-env node, mocha */
'use strict'

const followPlugin = require('../index')

const assert = require('assert')
const nock = require('nock')
const redis = require('redis')
const client = redis.createClient()
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const makeRequest = (fastify, options) => new Promise((resolve) => fastify.inject(options, resolve))

const configuration = {
  FOLLOW_REDIS_URL: '127.0.0.1'
}

let fastify
describe('follow', () => {
  before('drop redis', done => {
    client.flushall(done)
  })

  before('create fastify instance', (done) => {
    fastify = Fastify({ level: 'silent' })
    fastify.register(fp(followPlugin), configuration)
    fastify.ready(done)
  })
  before(() => nock.disableNetConnect())
  after(() => nock.enableNetConnect())

  after('destroy fastify', done => {
    if (!fastify) return done()
    fastify.close(done)
  })

  it('follow + gets + unfollow + gets', async () => {
    const USER_ID = 'the-user-id'
    const USERNAME = 'the-user-1'
    const JSON_WEB_TOKEN = 'the-json-web-token'

    const OTHER_USER_ID = '1111'

    const getMeNockScope = nock('http://localhost:3001')
      .replyContentLength()
      .get('/api/me')
      .times(6)
      .reply(200, {
        _id: USER_ID,
        username: USERNAME
      })

    let res, body

    res = await makeRequest(fastify, {
      method: 'POST',
      url: '/api/follow',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      },
      payload: JSON.stringify({
        userId: OTHER_USER_ID
      })
    })
    assert.equal(204, res.statusCode, res.payload)

    res = await makeRequest(fastify, {
      method: 'GET',
      url: '/api/following/me',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    assert.deepStrictEqual(body, [OTHER_USER_ID])

    res = await makeRequest(fastify, {
      method: 'GET',
      url: `/api/followers/${OTHER_USER_ID}`,
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    assert.deepStrictEqual(body, [USER_ID])

    res = await makeRequest(fastify, {
      method: 'POST',
      url: '/api/unfollow',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      },
      payload: JSON.stringify({
        userId: OTHER_USER_ID
      })
    })
    assert.equal(204, res.statusCode, res.payload)

    res = await makeRequest(fastify, {
      method: 'GET',
      url: '/api/following/me',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    assert.deepStrictEqual(body, [])

    res = await makeRequest(fastify, {
      method: 'GET',
      url: `/api/followers/${OTHER_USER_ID}`,
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    assert.deepStrictEqual(body, [])

    getMeNockScope.done()
  })
})
