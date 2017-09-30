'use strict'

const serie = require('fastseries')()

const {
  timeline: timelineSchema
} = require('./schemas')
const TimelineService = require('./TimelineService')

module.exports = function (fastify, opts, next) {
  serie(
    fastify,
    [
      registerEnv,
      registerUserClient,
      registerFollowClient,
      registerTweetClient,
      decorateWithTimelineService,
      registerRoutes
    ],
    opts,
    next
  )
}

function registerEnv (data, done) {
  const envOpts = {
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
    data: data
  }
  this.register(require('fastify-env'), envOpts, done)
}

function registerUserClient (a, done) {
  this.register(require('../userClient'), this.config, done)
}

function registerFollowClient (a, done) {
  this.register(require('../followClient'), this.config, done)
}

function registerTweetClient (a, done) {
  this.register(require('../tweetClient'), this.config, done)
}

function decorateWithTimelineService (a, done) {
  const timelineService = new TimelineService(this.followClient, this.tweetClient)
  this.decorate('timelineService', timelineService)
  done()
}

function registerRoutes (a, done) {
  const { timelineService, userClient } = this

  this.addHook('preHandler', async function (req, reply, done) {
    try {
      req.user = await userClient.getMe(req)
    } catch (e) {
      if (!reply.store.config.allowUnlogged) {
        return done(e)
      }
    }
    done()
  })

  this.get('/', timelineSchema, async function (req, reply) {
    const tweets = await timelineService.getTimeline(req.user._id)
    return tweets
  })

  done()
}
