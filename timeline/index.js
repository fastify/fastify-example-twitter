'use strict'

const fp = require('fastify-plugin')

const {
  timeline: timelineSchema
} = require('./schemas')
const TimelineService = require('./TimelineService')

module.exports = function (fastify, opts, next) {
  // See user/index.js for some little explainations
  fastify.register(require('fastify-env'), {
    schema: {
      type: 'object',
      required: [
        'USER_MICROSERVICE_BASE_URL',
        'FOLLOW_MICROSERVICE_BASE_URL',
        'TWEET_MICROSERVICE_BASE_URL'
      ],
      properties: {
        USER_MICROSERVICE_BASE_URL: { type: 'string', default: 'http://localhost:3001' },
        FOLLOW_MICROSERVICE_BASE_URL: { type: 'string', default: 'http://localhost:3001' },
        TWEET_MICROSERVICE_BASE_URL: { type: 'string', default: 'http://localhost:3001' }
      }
    },
    data: opts
  })

  fastify.register(function (fastify, opts, done) {
    fastify.register(require('../userClient'), fastify.config, done)
    fastify.register(require('../followClient'), fastify.config, done)
    fastify.register(require('../tweetClient'), fastify.config, done)

    fastify.register(fp(function decorateWithTimelineService (fastify, opts, done) {
      const timelineService = new TimelineService(fastify.followClient, fastify.tweetClient)
      fastify.decorate('timelineService', timelineService)
      done()
    }))

    fastify.register(registerRoutes)

    done()
  })

  next()
}

function registerRoutes (fastify, opts, done) {
  const { timelineService, userClient } = fastify

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

  fastify.get('/', timelineSchema, async function (req, reply) {
    const tweets = await timelineService.getTimeline(req.user._id)
    return tweets
  })

  done()
}
