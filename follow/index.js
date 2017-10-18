'use strict'

const fp = require('fastify-plugin')

const {
  follow: followSchema,
  unfollow: unfollowSchema,
  followers: followersSchema
} = require('./schemas')
const FollowService = require('./FollowService')

module.exports = function (fastify, opts, next) {
  // See user/index.js for some little explainations
  fastify.register(require('fastify-env'), {
    schema: {
      type: 'object',
      required: [ 'FOLLOW_REDIS_URL', 'USER_MICROSERVICE_BASE_URL' ],
      properties: {
        FOLLOW_REDIS_URL: { type: 'string', default: '127.0.0.1' },
        USER_MICROSERVICE_BASE_URL: { type: 'string', default: 'http://localhost:3001' }
      }
    },
    data: opts
  })

  fastify.register(function (fastify, opts, done) {
    fastify.register(require('fastify-redis'), {
      host: fastify.config.FOLLOW_REDIS_URL
    })

    fastify.register(fp(function decorateWithTweetService (fastify, opts, done) {
      const followService = new FollowService(fastify.redis)
      fastify.decorate('followService', followService)
      done()
    }))

    fastify.register(require('../userClient'), fastify.config, done)

    fastify.register(registerRoutes)

    done()
  })

  next()
}

function registerRoutes (fastify, opts, done) {
  const { followService, userClient } = fastify

  fastify.addHook('preHandler', async function (req, reply, done) {
    try {
      req.user = await userClient.getMe(req)
    } catch (e) {
      if (!reply.store.config.allowUnlogged) {
        return done(e)
      }
    }
    done()
  })

  fastify.post('/follow', followSchema, async function (req, reply) {
    const { userId } = req.body
    await followService.follow(req.user._id, userId)
    reply.code(204)
  })

  fastify.post('/unfollow', unfollowSchema, async function (req, reply) {
    const { userId } = req.body
    await followService.unfollow(req.user._id, userId)
    reply.code(204)
  })

  fastify.get('/following/me', function (req, reply) {
    return followService.getFollowing(req.user._id)
  })

  fastify.get('/followers/me', function (req, reply) {
    return followService.getFollowers(req.user._id)
  })

  fastify.get('/following/:userId', { config: { allowUnlogged: true } }, function (req, reply) {
    return followService.getFollowing(req.params.userId)
  })

  fastify.get('/followers/:userId', followersSchema, function (req, reply) {
    return followService.getFollowers(req.params.userId)
  })

  done()
}
