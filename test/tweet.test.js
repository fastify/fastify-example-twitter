'use strict'

const t = require('tap')
const MongoClient = require('mongodb').MongoClient

const Fastify = require('fastify')
const example = require('../index')

const config = require('./config')
const { registerUsers, login } = require('./test-util')

t.test('tweet', async t => {
  const mongoClient = await MongoClient.connect(config.MONGODB_URL, {useNewUrlParser: true})
  await mongoClient.db('test').dropDatabase()
  t.tearDown(() => mongoClient.close())

  const fastify = Fastify({ logger: { level: 'silent' } })
  fastify.register(example, config)
  t.tearDown(() => fastify.close())

  t.plan(1)

  t.test('add a tweet + get tweets', async t => {
    t.plan(12)

    const USERNAME = 'the-user-1'

    await registerUsers(t, fastify, [USERNAME])
    const jwt = await login(t, fastify, USERNAME)

    const TWEET_TEXT = 'the tweet text!'

    let res = await fastify.inject({
      method: 'POST',
      url: '/api/tweet',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      payload: {
        text: TWEET_TEXT
      }
    })
    t.equal(res.statusCode, 204, res.payload)

    res = await fastify.inject({
      method: 'GET',
      url: '/api/tweet',
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    })
    t.equal(res.statusCode, 200, res.payload)

    const myTweetBody = JSON.parse(res.payload)

    t.equal(myTweetBody.length, 1, res.payload)
    t.ok(myTweetBody[0]._id)
    t.ok(myTweetBody[0].user)
    t.ok(myTweetBody[0].user._id)
    t.deepEqual(myTweetBody[0].user.username, USERNAME)
    t.deepEqual(myTweetBody[0].text, TWEET_TEXT)

    res = await fastify.inject({
      method: 'GET',
      url: '/api/tweet/' + myTweetBody[0].user._id,
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    })
    t.equal(res.statusCode, 200, res.payload)
    const userTweetBody = JSON.parse(res.payload)
    t.deepEqual(userTweetBody, myTweetBody)
  })
})
