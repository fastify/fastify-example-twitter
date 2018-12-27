'use strict'

const t = require('tap')
const MongoClient = require('mongodb').MongoClient

const Fastify = require('fastify')
const example = require('../index')

const config = require('./config')
const { registerUsers, login, createTweet, follow } = require('./test-util')

t.test('user', async t => {
  const mongoClient = await MongoClient.connect(config.MONGODB_URL, {useNewUrlParser: true})
  await mongoClient.db('test').dropDatabase()
  t.tearDown(() => mongoClient.close())

  const fastify = Fastify({ logger: { level: 'silent' } })
  fastify.register(example, config)
  t.tearDown(() => fastify.close())

  t.plan(1)

  t.test('get timeline', async t => {
    t.plan(15)

    const [
      {userId: meUserId},
      {userId: friend1UserId},
      {userId: friend2UserId}
    ] = await registerUsers(t, fastify, [
      'my-username',
      'friend1-username',
      'friend2-username'
    ])
    const meJWT = await login(t, fastify, 'my-username')
    const fiend1JWT = await login(t, fastify, 'friend1-username')
    const fiend2JWT = await login(t, fastify, 'friend2-username')
    await createTweet(t, fastify, meJWT, 'tweet user id 1')
    await createTweet(t, fastify, fiend1JWT, 'tweet user id 2')
    await createTweet(t, fastify, fiend2JWT, 'tweet user id 3')
    await createTweet(t, fastify, meJWT, 'another tweet user id 1')

    await follow(t, fastify, meJWT, friend1UserId)
    await follow(t, fastify, meJWT, friend2UserId)

    const res = await fastify.inject({
      method: 'GET',
      url: '/api/timeline',
      headers: {
        'Authorization': 'Bearer ' + meJWT
      }
    })
    t.equal(200, res.statusCode, res.payload)

    const body = JSON.parse(res.payload)

    t.equal(body.length, 4, res.payload)
    t.deepEqual(body.map(t => ({userId: t.user._id, text: t.text})), [
      {
        userId: meUserId,
        text: 'another tweet user id 1'
      },
      {
        userId: friend2UserId,
        text: 'tweet user id 3'
      },
      {
        userId: friend1UserId,
        text: 'tweet user id 2'
      },
      {
        userId: meUserId,
        text: 'tweet user id 1'
      }
    ])
  })
})
