'use strict'

const path = require('path')
const fp = require('fastify-plugin')

const swaggerOption = {
  swagger: {
    info: {
      title: 'Test swagger',
      description: 'testing the fastify swagger api',
      version: '0.1.0'
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
}

const schema = {
  type: 'object',
  required: [ 'MONGODB_URL', 'REDIS_URL', 'JWT_SECRET' ],
  properties: {
    MONGODB_URL: { type: 'string' },
    REDIS_URL: { type: 'string' },
    JWT_SECRET: { type: 'string' }
  },
  additionalProperties: false
}

async function connectToDatabases (fastify) {
  fastify
    // `fastify-mongodb` makes this connection and store the database instance into `fastify.mongo.db`
    // See https://github.com/fastify/fastify-mongodb
    .register(require('fastify-mongodb'), { url: fastify.config.MONGODB_URL })
    // `fastify-redis` makes this connection and store the database instance into `fastify.redis`
    // See https://github.com/fastify/fastify-redis
    .register(require('fastify-redis'), { url: fastify.config.REDIS_URL })
}

async function authenticator (fastify) {
  fastify
    // JWT is used to identify the user
    // See https://github.com/fastify/fastify-jwt
    .register(require('fastify-jwt'), {
      secret: fastify.config.JWT_SECRET,
      algorithms: ['RS256']
    })
}

async function decorateFastifyInstance (fastify) {
  fastify
    .decorate('getUserIdFromRequest', function (req) {
      const jwt = (req.req.headers.authorization || '').substr(7)
      const decoded = this.jwt.decode(jwt)
      return decoded._id
    })
    .decorate('getAuthenticationTokenForUser', function (user) {
      return this.jwt.sign(user)
    })
    // This decoration is only a short cut
    .decorate('transformStringIntoObjectId', fastify.mongo.ObjectId.createFromHexString)
}

async function preHandler (req, reply) {
  try {
    const userIdString = this.getUserIdFromRequest(req)
    const userId = this.transformStringIntoObjectId(userIdString)
    req.user = await this.userClient.getMe(userId)
  } catch (e) {
    if (!reply.context.config.allowUnlogged) {
      throw e
    }
  }
}

const protectedModules = fp(async function protectedModules (fastify) {
  fastify.addHook('preHandler', preHandler)

  fastify
    .register(require('./tweet'), { prefix: '/api/tweet' })
    .register(require('./follow'), { prefix: '/api/follow' })
    .register(require('./timeline'), { prefix: '/api/timeline' })
}, {
  decorators: {
    fastify: [
      'getUserIdFromRequest',
      'transformStringIntoObjectId',
      'userClient'
    ]
  }
})

module.exports = async function (fastify, opts) {
  fastify
    .register(require('fastify-swagger'), swaggerOption)
    // fastify-env checks and coerces the environment variables and save the result in `fastify.config`
    // See https://github.com/fastify/fastify-env
    .register(require('fastify-env'), { schema, data: [ process.env, opts ], env: false })
    .register(fp(connectToDatabases))
    .register(fp(authenticator))
    .register(fp(decorateFastifyInstance))
    .register(require('./user'), { prefix: '/api/user' })
    .register(protectedModules)
    .register(require('fastify-static'), {
      root: path.join(__dirname, 'frontend', 'build'),
      prefix: '/'
    })
}
