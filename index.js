'use strict'

const path = require('path')
const fp = require('fastify-plugin')

const UserService = require('./user/service')
const TweetService = require('./tweet/service')
const FollowService = require('./follow/service')
const TimelineService = require('./timeline/service')

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
    .register(require('fastify-mongodb'), { url: fastify.config.MONGODB_URL, useNewUrlParser: true })
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

function transformStringIntoObjectId (str) {
  return new this.mongo.ObjectId(str)
}

async function decorateFastifyInstance (fastify) {
  const db = fastify.mongo.db

  const userCollection = await db.createCollection('users')
  const userService = new UserService(userCollection)
  await userService.ensureIndexes(db)
  fastify.decorate('userService', userService)

  const tweetCollection = await db.createCollection('tweets')
  const tweetService = new TweetService(tweetCollection)
  await tweetService.ensureIndexes(db)
  fastify.decorate('tweetService', tweetService)

  const followService = new FollowService(fastify.redis)
  fastify.decorate('followService', followService)

  const timelineService = new TimelineService(followService, tweetService)
  fastify.decorate('timelineService', timelineService)

  fastify.decorate('authPreHandler', async function auth (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  fastify.decorate('transformStringIntoObjectId', transformStringIntoObjectId)
}

module.exports = async function (fastify, opts) {
  fastify
    .register(require('fastify-swagger'), swaggerOption)
    // fastify-env checks and coerces the environment variables and save the result in `fastify.config`
    // See https://github.com/fastify/fastify-env
    .register(require('fastify-env'), { schema, data: [ opts ] })
    .register(fp(connectToDatabases))
    .register(fp(authenticator))
    .register(fp(decorateFastifyInstance))
    // APIs modules
    .register(require('./user'), { prefix: '/api/user' })
    .register(require('./tweet'), { prefix: '/api/tweet' })
    .register(require('./follow'), { prefix: '/api/follow' })
    .register(require('./timeline'), { prefix: '/api/timeline' })
    // Serving static files
    .register(require('fastify-static'), {
      root: path.join(__dirname, 'frontend', 'build'),
      prefix: '/'
    })
}
