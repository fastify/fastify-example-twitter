'use strict'

const fp = require('fastify-plugin')

const USER_COLLECTION_NAME = 'user'

const {
  login: loginSchema,
  registration: registrationSchema,
  search: searchSchema,
  getProfile: getProfileSchema
} = require('./schemas')

const UserService = require('./service')
const UserClient = require('./client')

module.exports = fp(async function (fastify, opts) {
  // setup USER_COLLECTION_NAME collection with validator and indexes
  const db = fastify.mongo.db
  const userCollection = await db.createCollection(USER_COLLECTION_NAME)
  await db.command({
    'collMod': USER_COLLECTION_NAME,
    validator: {
      username: { $type: 'string' },
      password: { $type: 'string' }
    }
  })
  await userCollection.createIndex({ username: 1 }, {unique: true})

  const userService = new UserService(userCollection)
  // This is a fastify plugin.
  // The following decorations are shared among all modules!
  fastify.decorate('userClient', new UserClient(userService))

  // This registration create an encaptulated module.
  // All registration made inside aren't shared among the modules!
  // Keep your business logic secret!
  fastify.register(async function (fastify) {
    // This decoration will be use to call our business logic
    fastify.decorate('userService', userService)

    // Route registration
    // fastify.<method>(<path>, <schema>, <handler>)
    // schema is used to validate the input and serialize the output
    // In all handlers the `this` is the `fastify` instance
    // in which the decorations defined above are available
    fastify.post('/login', loginSchema, loginHandler)
    fastify.post('/register', registrationSchema, registerHandler)
    fastify.get('/me', meHandler)
    fastify.get('/:userId', getProfileSchema, userHandler)
    fastify.get('/search', searchSchema, searchHandler)
  }, { prefix: opts.prefix })
}, {
  decorators: {
    fastify: [
      'mongo',
      'getAuthenticationTokenForUser',
      'getUserIdFromRequest',
      'transformStringIntoObjectId'
    ]
  }
})

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration

// This is the handler that implement the login
// Fastify helps us to split the HTTP handler to business logic
// Thank to previour decorations:
// - `this.userService` is the instance of UserService
// - `this.getAuthenticationTokenForUser` is the decoration made in "/index.js"
async function loginHandler (req, reply) {
  const { username, password } = req.body
  const user = await this.userService.login(username, password)
  return { jwt: this.getAuthenticationTokenForUser(user) }
}

async function registerHandler (req, reply) {
  const { username, password } = req.body
  const userId = await this.userService.register(username, password)
  return { userId }
}

async function meHandler (req, reply) {
  const userId = this.getUserIdFromRequest(req)
  const user = await this.userService.getProfile(this.transformStringIntoObjectId(userId))
  return user
}

async function userHandler (req, reply) {
  const user = await this.userService.getProfile(this.transformStringIntoObjectId(req.params.userId))
  return user
}

async function searchHandler (req, reply) {
  const { search } = req.query
  const users = await this.userService.search(search)
  return users
}
