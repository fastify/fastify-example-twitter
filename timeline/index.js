'use strict'

const {
  timeline: timelineSchema
} = require('./schemas')
const TimelineService = require('./TimelineService')

module.exports = async function (fastify, opts) {
  if (!fastify.userClient) throw new Error('`fastify.userClient` is undefined')
  if (!fastify.followClient) throw new Error('`fastify.followClient` is undefined')
  if (!fastify.tweetClient) throw new Error('`fastify.tweetClient` is undefined')

  const timelineService = new TimelineService(fastify.followClient, fastify.tweetClient)
  fastify.decorate('timelineService', timelineService)
  fastify.addHook('preHandler', preHandler)
  fastify.get('/', timelineSchema, getTimelineHandler)
}

async function preHandler (req, reply) {
  try {
    req.user = await this.userClient.getMe(req)
  } catch (e) {
    if (!reply.context.config.allowUnlogged) {
      throw e
    }
  }
}

async function getTimelineHandler (req, reply) {
  const tweets = await this.timelineService.getTimeline(req.user._id)
  return tweets
}
