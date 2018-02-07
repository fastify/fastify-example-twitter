/* eslint-env node, mocha */
'use strict'

const followPlugin = require('../follow')

const util = require('util')
const nock = require('nock')
const redis = require('redis')
const client = redis.createClient()
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const t = require('tap')

let userPrehandler = []
const USER_ID = 'the-user-id'

async function injectUser (fastify) {
  fastify.addHook('preHandler', async function (req, reply) {
    req.user = userPrehandler.shift()
  })
}

const REDIS_URL = 'redis://localhost:6379'

t.test('follow', async t => {
  await util.promisify(client.flushall).call(client)
  t.tearDown(done => client.end(done))

  nock.disableNetConnect()
  t.tearDown(() => nock.enableNetConnect())

  const fastify = Fastify({ logger: { level: 'silent' } })
  fastify
    .register(require('fastify-redis'), { url: REDIS_URL })
    .register(fp(injectUser))
    .register(followPlugin)
  t.tearDown(() => fastify.close())

  t.plan(1)

  t.test('follow + gets + unfollow + gets', async t => {
    t.plan(11)
    const USERNAME = 'the-user-1'
    const JSON_WEB_TOKEN = 'the-json-web-token'

    const OTHER_USER_ID = '1111'

    userPrehandler = [
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
    t.equal(204, res.statusCode, res.payload)

    res = await fastify.inject({
      method: 'GET',
      url: '/following/me',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    t.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    t.deepEqual(body, [OTHER_USER_ID])

    res = await fastify.inject({
      method: 'GET',
      url: `/followers/${OTHER_USER_ID}`,
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    t.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    t.deepEqual(body, [USER_ID])

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
    t.equal(204, res.statusCode, res.payload)

    res = await fastify.inject({
      method: 'GET',
      url: '/following/me',
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    t.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    t.deepEqual(body, [])

    res = await fastify.inject({
      method: 'GET',
      url: `/followers/${OTHER_USER_ID}`,
      headers: {
        'Authorization': 'Bearer ' + JSON_WEB_TOKEN
      }
    })
    t.equal(200, res.statusCode, res.payload)
    body = JSON.parse(res.payload)
    t.deepEqual(body, [])

    t.deepEqual(userPrehandler.length, 0)
  })
})
