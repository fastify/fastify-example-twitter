'use strict'

const fp = require('fastify-plugin')

const {
  login: loginSchema,
  registration: registrationSchema,
  search: searchSchema,
  getProfile: getProfileSchema
} = require('./schemas')
const UserService = require('./UserService')

/*
 * This is the user plugin
 * A plugin is a self contained component, so we need to made some operations:
 * - check the configuration (fastify-env)
 * - connect to mongodb (fastify-mongodb)
 * - configure JWT library (fastify-jwt)
 * - build business login objects
 * - define the HTTP API
 */
module.exports = function (fastify, opts, next) {
  // This is a plugin registration inside a plugin
  // fastify-env checks and coerces `opts` and save the result in `fastify.config`
  // See https://github.com/fastify/fastify-env
  fastify.register(require('fastify-env'), {
    schema: {
      type: 'object',
      required: [ 'USER_MONGO_URL', 'JWT_SECRET' ],
      properties: {
        USER_MONGO_URL: { type: 'string', default: 'mongodb://localhost/user' },
        JWT_SECRET: { type: 'string', default: 'changeme!' }
      }
    },
    data: opts
  })

  // This registration is made in order to wait the previous one
  // `avvio` (https://github.com/mcollina/avvio), the startup manager of `fastify`,
  // registers this plugin only when the previous plugin has been registered
  fastify.register(function (fastify, opts, done) {
    // We need a connection database:
    // `fastify-mongodb` makes this connection and store the database instance into `fastify.mongo.db`
    // See https://github.com/fastify/fastify-mongodb
    fastify.register(require('fastify-mongodb'), {
      url: fastify.config.USER_MONGO_URL
    })

    // Create our business login object and store it in fastify instance
    // Because we need `userCollection` *after* (and not only in) this plugin,
    // we need to use `fastify-plugin` to ask to `fastify` don't encapsulate `decorateWithUserCollection`
    // but to share the same fastify instance between inside and outside.
    // In this way all decorations are available outside too.
    fastify.register(fp(function decorateWithUserCollection (fastify, opts, done) {
      fastify.decorate('userCollection', fastify.mongo.db.collection('users'))
      done()
    }))

    // JWT is used to identify the user
    // See https://github.com/fastify/fastify-jwt
    fastify.register(require('fastify-jwt'), {
      secret: fastify.config.JWT_SECRET,
      algorithms: ['RS256']
    })

    // Each plugin is standalone, so the database shoud be set up
    // Mongodb has no schema but we need to specify some indexes and validators
    fastify.register(function (fastify, opts, done) {
      require('./mongoCollectionSetup')(fastify.mongo.db, fastify.userCollection, done)
    })

    // Add another business logic object to `fastify` instance
    // Again, `fastify-plugin` is used in order to access to `fastify.userService` from outside
    fastify.register(fp(function (fastify, opts, done) {
      const userService = new UserService(fastify.userCollection, fastify.jwt)
      fastify.decorate('userService', userService)
      done()
    }))

    // Finally we're registering out routes
    fastify.register(registerRoutes)

    done()
  })

  next()
}

function registerRoutes (fastify, opts, done) {
  // extract the useful objects
  const { userService } = fastify
  const { ObjectId } = fastify.mongo

  // registering login defining the input schema and the output schema
  // See ./schemas.js
  fastify.post('/login', loginSchema, async function (req, reply) {
    const { username, password } = req.body
    const jwt = await userService.login(username, password)

    return {jwt}
  })

  fastify.post('/register', registrationSchema, async function (req, reply) {
    const { username, password } = req.body
    await userService.register(username, password)
    return {}
  })

  fastify.get('/me', async function (req, reply) {
    const jwt = (req.req.headers.authorization || '').substr(7)
    const decoded = userService.decode(jwt)
    const user = await userService.getProfile(ObjectId.createFromHexString(decoded._id))
    return user
  })

  fastify.get('/:userId', getProfileSchema, async function (req, reply) {
    const user = await userService.getProfile(ObjectId.createFromHexString(req.params.userId))
    return user
  })

  fastify.get('/search', searchSchema, async function (req, reply) {
    const { search } = req.query
    const users = await userService.search(search)
    return users
  })

  done()
}
