/* eslint-env node, mocha */
'use strict'

const followPlugin = require('../follow')

const assert = require('assert')
const nock = require('nock')
const redis = require('redis')
const client = redis.createClient()
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

const REDIS_URL = 'redis://localhost:6379'

let fastify
describe('follow', () => {
  before('drop redis', done => {
    client.flushall(done)
  })

  before('create fastify instance', (done) => {
    fastify = Fastify({ logger: { level: 'silent' } })
    fastify.register(require('fastify-redis'), { url: REDIS_URL })
      .register(fp(fakeUserClient))
      .register(followPlugin)
      .ready(done)
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

    getMeReturn = [
      { _id: USER_ID, username: USERNAME },
      { _id: USER_ID, username: USERNAME },
      { _id: USER_ID, username: USERNAME },
      { _id: USER_ID, username: USERNAME },
      { _id: USER_ID, username: USERNAME },
      { _id: USER_ID, username: USERNAME }
    ]

    let res, body

    res = await fastify.inject({
      method: 'POST',
      url: '/follow',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      },
      payload: JSON.stringify({
        userId: OTHER_USER_ID
      })
    })
    assert.equal(204, res.statusCode, res.payload)

    res = await fastify.inject({
      method: 'GET',
      url: '/following/me',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    assert.deepStrictEqual(body, [OTHER_USER_ID])

    res = await fastify.inject({
      method: 'GET',
      url: `/followers/${OTHER_USER_ID}`,
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    assert.deepStrictEqual(body, [USER_ID])

    res = await fastify.inject({
      method: 'POST',
      url: '/unfollow',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      },
      payload: JSON.stringify({
        userId: OTHER_USER_ID
      })
    })
    assert.equal(204, res.statusCode, res.payload)

    res = await fastify.inject({
      method: 'GET',
      url: '/following/me',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    assert.deepStrictEqual(body, [])

    res = await fastify.inject({
      method: 'GET',
      url: `/followers/${OTHER_USER_ID}`,
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    assert.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    assert.deepStrictEqual(body, [])

    assert.deepStrictEqual(getMeArguments.length, 6)
  })
})
