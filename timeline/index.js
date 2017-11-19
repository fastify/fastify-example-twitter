'use strict'

const fp = require('fastify-plugin')

const {
  timeline: timelineSchema
} = require('./schemas')
const TimelineService = require('./TimelineService')

module.exports = async function (fastify, opts) {
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

  fastify.register(async function (fastify, opts) {
    fastify.register(require('../userClient'), fastify.config)
      .register(require('../followClient'), fastify.config)
      .register(require('../tweetClient'), fastify.config)

    fastify.register(fp(async function decorateWithTimelineService (fastify, opts) {
      const timelineService = new TimelineService(fastify.followClient, fastify.tweetClient)
      fastify.decorate('timelineService', timelineService)
    }))

    fastify.register(registerRoutes)
  })
}

async function registerRoutes (fastify, opts) {
  const { timelineService, userClient } = fastify

  fastify.addHook('preHandler', async function (req, reply) {
    try {
      req.user = await userClient.getMe(req)
    } catch (e) {
      if (!reply.context.config.allowUnlogged) {
        throw e
      }
    }
  })

  fastify.get('/', timelineSchema, async function (req, reply) {
    const tweets = await timelineService.getTimeline(req.user._id)
    return tweets
  })
}
