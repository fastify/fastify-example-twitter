'use strict'

const USER_COLLECTION_NAME = 'user'

const {
  login: loginSchema,
  registration: registrationSchema,
  search: searchSchema,
  getProfile: getProfileSchema
} = require('./schemas')
const UserService = require('./UserService')

module.exports = async function (fastify, opts) {
  if (!fastify.mongo) throw new Error('`fastify.mongo` is undefined')
  if (!fastify.config) throw new Error('`fastify.config` is undefined')
  if (!fastify.config.JWT_SECRET) throw new Error('`fastify.config.JWT_SECRET` is undefined')

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

  fastify
    // JWT is used to identify the user
    // In `fastify` instance will have `verify` and `decode` method
    // See https://github.com/fastify/fastify-jwt
    .register(require('fastify-jwt'), {
      secret: fastify.config.JWT_SECRET,
      algorithms: ['RS256']
    })
    // When this handler is called, `fastify-jwt` is initialized
    // decorating `fastify` instance with `jwt` property
    .register(async function (fastify) {
      const userService = new UserService(userCollection, fastify.jwt)
      // This decoration will be use to call our business logic
      fastify.decorate('userService', userService)
      // This decoration is only a short cut
      fastify.decorate('transformStringIntoObjectId', fastify.mongo.ObjectId.createFromHexString)

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
    })
}

async function loginHandler (req, reply) {
  const { username, password } = req.body
  const jwt = await this.userService.login(username, password)
  return {jwt}
}

async function registerHandler (req, reply) {
  const { username, password } = req.body
  await this.userService.register(username, password)
  return {}
}

async function meHandler (req, reply) {
  const jwt = (req.req.headers.authorization || '').substr(7)
  const decoded = this.userService.decode(jwt)
  const user = await this.userService.getProfile(this.transformStringIntoObjectId(decoded._id))
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
