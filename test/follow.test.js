'use strict'

const t = require('tap')
const MongoClient = require('mongodb').MongoClient

const Fastify = require('fastify')
const example = require('../index')

const config = require('./config')
const { registerUsers, login } = require('./test-util')

t.test('follow', async t => {
  const mongoClient = await MongoClient.connect(config.MONGODB_URL, {useNewUrlParser: true})
  await mongoClient.db('test').dropDatabase()
  t.tearDown(() => mongoClient.close())

  const fastify = Fastify({ logger: { level: 'silent' } })
  fastify.register(example, config)
  t.tearDown(() => fastify.close())

  t.plan(1)

  t.test('follow + gets + unfollow + gets', async t => {
    t.plan(13)

    const ME_USERNAME = 'me-username'
    const FRIEND_USERNAME = 'friend-username'

    const [ { userId: meUserId }, { userId: friendUserId } ] = await registerUsers(t, fastify, [ME_USERNAME, FRIEND_USERNAME])
    const jwt = await login(t, fastify, ME_USERNAME)

    const followMyFriendResponse = await fastify.inject({
      method: 'POST',
      url: '/api/follow/follow',
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      payload: {
        userId: friendUserId
      }
    })
    t.equal(204, followMyFriendResponse.statusCode, followMyFriendResponse.payload)

    const getWhoIFollowResponse = await fastify.inject({
      method: 'GET',
      url: '/api/follow/following/me',
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    })
    t.equal(200, getWhoIFollowResponse.statusCode, getWhoIFollowResponse.payload)
    const getWhoIFollowBody = JSON.parse(getWhoIFollowResponse.payload)
    t.deepEqual(getWhoIFollowBody, [friendUserId])

    const getFriendFollowersResponse = await fastify.inject({
      method: 'GET',
      url: `/api/follow/followers/${friendUserId}`,
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    })
    t.equal(200, getFriendFollowersResponse.statusCode, getFriendFollowersResponse.payload)
    const getFriendFollowersBody = JSON.parse(getFriendFollowersResponse.payload)
    t.deepEqual(getFriendFollowersBody, [meUserId])

    const unfollowResponse = await fastify.inject({
      method: 'POST',
      url: '/api/follow/unfollow',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      payload: JSON.stringify({
        userId: friendUserId
      })
    })
    t.equal(204, unfollowResponse.statusCode, unfollowResponse.payload)

    const getWhoIFollowResponse2 = await fastify.inject({
      method: 'GET',
      url: '/api/follow/following/me',
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    })
    t.equal(200, getWhoIFollowResponse2.statusCode, getWhoIFollowResponse2.payload)
    const getWhoIFollowBody2 = JSON.parse(getWhoIFollowResponse2.payload)
    t.deepEqual(getWhoIFollowBody2, [])

    const getFriendFollowersResponse2 = await fastify.inject({
      method: 'GET',
      url: `/api/follow/followers/${friendUserId}`,
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    })
    t.equal(200, getFriendFollowersResponse2.statusCode, getFriendFollowersResponse2.payload)
    const getFriendFollowersBody2 = JSON.parse(getFriendFollowersResponse2.payload)
    t.deepEqual(getFriendFollowersBody2, [])
  })
})
