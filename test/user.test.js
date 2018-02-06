'use strict'

const userPlugin = require('../user')

const MongoClient = require('mongodb').MongoClient
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const t = require('tap')

const MONGODB_URL = 'mongodb://localhost:27017/test'

let getUserIdFromRequestArguments = []
let getUserIdFromRequestReturn = []
let getAuthenticationTokenForUserArguments = []
let getAuthenticationTokenForUserReturn = []
async function fakeDecoration (fastify) {
  fastify.decorate('getUserIdFromRequest', function (payload) {
    getUserIdFromRequestArguments.push(payload)
    return getUserIdFromRequestReturn.shift()
  })
  fastify.decorate('getAuthenticationTokenForUser', function (payload) {
    getAuthenticationTokenForUserArguments.push(payload)
    return getAuthenticationTokenForUserReturn.shift()
  })
  fastify.decorate('transformStringIntoObjectId', fastify.mongo.ObjectId)
}

t.test('user', async t => {
  const mongoClient = await MongoClient.connect(MONGODB_URL)
  await mongoClient.db('test').dropDatabase()
  t.tearDown(() => mongoClient.close())

  const fastify = Fastify({ logger: { level: 'silent' } })
  fastify.register(require('fastify-mongodb'), { url: MONGODB_URL })
    .register(fp(fakeDecoration))
    .register(userPlugin)
  t.tearDown(() => fastify.close())

  t.plan(2)

  t.test('registration + login + me', async t => {
    t.plan(7)

    const USERNAME = 'the-user-1'
    const PASSWORD = 'the-password'

    getAuthenticationTokenForUserReturn = [ 'the jwt token' ]

    const regRes = await fastify.inject({
      method: 'POST',
      url: '/register',
      headers: {
        'Content-type': 'application/json'
      },
      payload: JSON.stringify({
        username: USERNAME,
        password: PASSWORD
      })
    })
    t.equal(200, regRes.statusCode, regRes.payload)
    const { userId } = JSON.parse(regRes.payload)

    getUserIdFromRequestReturn = [ userId ]

    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/login',
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
    t.equal(jwt, 'the jwt token')

    const getMeRes = await fastify.inject({
      method: 'GET',
      url: '/me',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Baerer ' + jwt
      }
    })
    t.equal(200, getMeRes.statusCode, getMeRes.payload)
    const { username, password, _id } = JSON.parse(getMeRes.payload)
    t.equal(USERNAME, username)
    t.equal(undefined, password)
    t.ok(_id)
  })

  t.test('search', async t => {
    t.plan(10)

    const USERNAMES = [ 'user-foo-1', 'user-foo-2', 'user-foo-3', 'another-user' ]
    await Promise.all(USERNAMES.map(username => {
      return fastify.inject({
        method: 'POST',
        url: '/register',
        headers: {
          'Content-type': 'application/json'
        },
        payload: JSON.stringify({
          username: username,
          password: 'the-password'
        })
      })
        .then(res => {
          t.equal(200, res.statusCode, res.payload)
        })
    }))

    const searchRes = await fastify.inject({
      method: 'GET',
      url: '/search?search=-foo-'
    })
    t.equal(200, searchRes.statusCode, searchRes.payload)

    const users = JSON.parse(searchRes.payload)
    t.equal(3, users.length)

    t.ok(users.find(u => u.username === USERNAMES[0]))
    t.ok(users.find(u => u.username === USERNAMES[1]))
    t.ok(users.find(u => u.username === USERNAMES[2]))
    t.ok(!users.find(u => u.username === USERNAMES[3]))
  })
})
