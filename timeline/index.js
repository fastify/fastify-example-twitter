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
    fastify
      .decorate('timelineService', timelineService)
      .get('/', timelineSchema, getTimelineHandler)
  }, { prefix: opts.prefix })
}, {
  decorators: {
    fastify: [
      'followClient',
      'tweetClient',
      'transformStringIntoObjectId'
    ]
  }
})

async function getTimelineHandler (req, reply) {
  return this.timelineService.getTimeline(req.user._id)
}
