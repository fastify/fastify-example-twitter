/* eslint-env node, mocha */
'use strict'

const userPlugin = require('../index')

const assert = require('assert')
const MongoClient = require('mongodb').MongoClient
const Fastify = require('fastify')
const fp = require('fastify-plugin')

const makeRequest = (fastify, options) => new Promise((resolve) => fastify.inject(options, resolve))

const configuration = {
  USER_MONGO_URL: 'mongodb://localhost/user',
  JWT_SECRET: 'the secret'
}

let fastify
describe('user', () => {
  before('drop mongo', () => {
    return MongoClient.connect(configuration.USER_MONGO_URL)
      .then(mongoClient => {
        mongoClient.unref()
        return mongoClient.dropDatabase()
      })
  })
  before('create fastify instance', (done) => {
    fastify = Fastify({ level: 'silent' })
    fastify.register(fp(userPlugin), configuration)
    fastify.ready(done)
  })

  after('destroy fastify', done => {
    if (!fastify) return done()
    fastify.close(done)
  })

  it('registration + login', () => {
    const USERNAME = 'the-user-1'
    const PASSWORD = 'the-password'
    return makeRequest(fastify, {
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
      .then(res => {
        assert.equal(200, res.statusCode)
      })
      .then(() => {
        return makeRequest(fastify, {
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
          .then(res => {
            assert.equal(200, res.statusCode)
            const { jwt } = JSON.parse(res.payload)
            assert.ok(jwt)
            return jwt
          })
          .then(jwt => {
            return makeRequest(fastify, {
              method: 'GET',
              url: '/me',
              headers: {
                'Content-type': 'application/json',
                'Authorization': 'Baerer ' + jwt
              }
            })
              .then(res => {
                assert.equal(200, res.statusCode)
                const { username, password, _id } = JSON.parse(res.payload)
                assert.equal(USERNAME, username)
                assert.equal(undefined, password)
                assert.ok(_id)
              })
          })
      })
  })

  it('search', () => {
    const USERNAMES = [ 'user-foo-1', 'user-foo-2', 'user-foo-3', 'another-user' ]
    return Promise.all(USERNAMES.map(username => {
      return makeRequest(fastify, {
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
      .then(() => {
        return makeRequest(fastify, {
          method: 'GET',
          url: '/search?search=-foo-'
        })
          .then(res => {
            assert.equal(200, res.statusCode, res.payload)

            const users = JSON.parse(res.payload)
            assert.equal(3, users.length)

            assert.ok(users.find(u => u.username === USERNAMES[0]))
            assert.ok(users.find(u => u.username === USERNAMES[1]))
            assert.ok(users.find(u => u.username === USERNAMES[2]))
            assert.ok(!users.find(u => u.username === USERNAMES[3]))
          })
      })
  })
})
