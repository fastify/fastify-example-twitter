/* eslint-env node, mocha */
'use strict'

const userPlugin = require('../user')

const assert = require('assert')
const MongoClient = require('mongodb').MongoClient
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const MONGODB_URL = 'mongodb://localhost:27017/test'

let signArguments = []
let signReturn = []
let verifyArguments = []
let verifyReturn = []
let decodeArguments = []
let decodeReturn = []
async function fakeJWT (fastify) {
  fastify.decorate('jwt', {
    sign: function (payload) {
      signArguments.push(payload)
      return signReturn.shift()
    },
    verify: function (token) {
      verifyArguments.push(token)
      return verifyReturn.shift()
    },
    decode: function (token) {
      decodeArguments.push(token)
      return decodeReturn.shift()
    }
  })
}

let fastify
describe('user', () => {
  before('drop mongo', () => {
    return MongoClient.connect(MONGODB_URL)
      .then(mongoClient => {
        mongoClient.unref()
        return mongoClient.dropDatabase()
      })
  })

  before('create fastify instance', (done) => {
    fastify = Fastify({ logger: { level: 'silent' } })
    fastify.register(require('fastify-mongodb'), { url: MONGODB_URL })
      .register(fp(fakeJWT))
      .register(userPlugin)
      .ready(done)
  })

  after('destroy fastify', done => {
    if (!fastify) return done()
    fastify.close(done)
  })

  beforeEach(() => { signArguments = [] })
  beforeEach(() => { signReturn = [] })

  it('registration + login', async () => {
    const USERNAME = 'the-user-1'
    const PASSWORD = 'the-password'

    signReturn = [
      'the jwt token'
    ]

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
    assert.equal(200, regRes.statusCode, regRes.payload)
    const { userId } = JSON.parse(regRes.payload)

    decodeReturn = [
      { username: USERNAME, _id: userId }
    ]

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
    assert.equal(200, loginRes.statusCode, loginRes.payload)
    const { jwt } = JSON.parse(loginRes.payload)
    assert.equal(jwt, 'the jwt token')

    const getMeRes = await fastify.inject({
      method: 'GET',
      url: '/me',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Baerer ' + jwt
      }
    })
    assert.equal(200, getMeRes.statusCode, getMeRes.payload)
    const { username, password, _id } = JSON.parse(getMeRes.payload)
    assert.equal(USERNAME, username)
    assert.equal(undefined, password)
    assert.ok(_id)
  })

  it('search', async () => {
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
          assert.equal(200, res.statusCode, res.payload)
        })
    }))

    const searchRes = await fastify.inject({
      method: 'GET',
      url: '/search?search=-foo-'
    })
    assert.equal(200, searchRes.statusCode, searchRes.payload)

    const users = JSON.parse(searchRes.payload)
    assert.equal(3, users.length)

    assert.ok(users.find(u => u.username === USERNAMES[0]))
    assert.ok(users.find(u => u.username === USERNAMES[1]))
    assert.ok(users.find(u => u.username === USERNAMES[2]))
    assert.ok(!users.find(u => u.username === USERNAMES[3]))
  })
})
