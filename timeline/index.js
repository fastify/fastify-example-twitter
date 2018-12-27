'use strict'

const {
  timeline: timelineSchema
} = require('./schemas')

module.exports = async function (fastify, opts) {
  fastify.addHook('preHandler', fastify.authPreHandler)
  fastify.get('/', timelineSchema, getTimelineHandler)
}

module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'authPreHandler',
      'timelineService'
    ]
  }
}

async function getTimelineHandler (req, reply) {
  return this.timelineService.getTimeline(req.user._id)
}
