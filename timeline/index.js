'use strict'

const fp = require('fastify-plugin')

const {
  timeline: timelineSchema
} = require('./schemas')
const TimelineService = require('./service')

// See users/index.js for more explainations!
module.exports = fp(async function (fastify, opts) {
  const timelineService = new TimelineService(fastify.followClient, fastify.tweetClient, fastify.transformStringIntoObjectId)

  fastify.register(async function (fastify) {
    fastify.decorate('timelineService', timelineService)
    fastify.addHook('preHandler', preHandler)
    fastify.get('/', timelineSchema, getTimelineHandler)
  }, { prefix: opts.prefix })
}, {
  decorators: {
    fastify: [
      'userClient',
      'followClient',
      'tweetClient',
      'getUserIdFromRequest',
      'transformStringIntoObjectId'
    ]
  }
})

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

async function getTimelineHandler (req, reply) {
  return this.timelineService.getTimeline(req.user._id)
}
