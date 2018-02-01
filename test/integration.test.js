/* eslint-env node, mocha */
'use strict'

const app = require('../index')

const MongoClient = require('mongodb').MongoClient

const util = require('util')
const nock = require('nock')
const redis = require('redis')
const client = redis.createClient()
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const t = require('tap')

const REDIS_URL = 'redis://localhost:6379'
const MONGODB_URL = 'mongodb://localhost/testIntegration'
const JWT_SECRET = 'the-secret'

t.test('integration', async t => {
  const mongoClient = await MongoClient.connect(MONGODB_URL)
  await mongoClient.dropDatabase()
  t.tearDown(() => mongoClient.close())

  await util.promisify(client.flushall).call(client)
  t.tearDown(done => client.end(done))

  nock.disableNetConnect()
  t.tearDown(() => nock.enableNetConnect())

  const fastify = Fastify({ logger: { level: 'silent' } })
    .register(fp(app), { MONGODB_URL, REDIS_URL, JWT_SECRET })
  t.tearDown(() => fastify.close())

  t.plan(1)

  t.test('flow', async t => {
    t.plan(7)

    const USERNAME = 'the-user-1'
    const PASSWORD = 'the-password'

    const regRes = await fastify.inject({
      method: 'POST',
      url: '/api/user/register',
      headers: {
        'Content-type': 'application/json'
      },
      payload: JSON.stringify({
        username: USERNAME,
        password: PASSWORD
      })
    })
    t.equal(200, regRes.statusCode, regRes.payload)

    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/api/user/login',
      headers: {
        'Content-type': 'application/json'
      },
      payload: JSON.stringify({
        username: USERNAME,
        password: PASSWORD
      })
    })
    t.equal(200, loginRes.statusCode, loginRes.payload)
    const { jwt } = JSON.parse(loginRes.payload)

    const getTimelineRes = await fastify.inject({
      method: 'GET',
      url: '/api/timeline',
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    })
    t.equal(200, getTimelineRes.statusCode, getTimelineRes.payload)

    const createTweetRes = await fastify.inject({
      method: 'POST',
      url: '/api/tweet',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      payload: JSON.stringify({
        text: 'some text'
      })
    })
    t.equal(createTweetRes.statusCode, 204, createTweetRes.payload)

    const getTimelineRes2 = await fastify.inject({
      method: 'GET',
      url: '/api/timeline',
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    })
    t.equal(200, getTimelineRes2.statusCode, getTimelineRes2.payload)
    t.equal(JSON.parse(getTimelineRes2.payload).length, 1)

    t.pass()
  })
})
