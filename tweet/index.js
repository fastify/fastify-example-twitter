'use strict'

const {
  tweet: tweetSchema,
  getTweets: getTweetsSchema,
  getUserTweets: getUserTweetsSchema
} = require('./schemas')

module.exports = async function (fastify, opts) {
  // All APIs are under authentication here!
  fastify.addHook('preHandler', fastify.authPreHandler)

  fastify.post('/', { schema: tweetSchema }, addTwitterHandler)
  fastify.get('/', { schema: getTweetsSchema }, getTwitterHandler)
  fastify.get('/:userIds', { schema: getUserTweetsSchema }, getUserTweetsHandler)
}

module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'authPreHandler',
      'tweetService'
    ]
  }
}

async function addTwitterHandler (req, reply) {
  const { text } = req.body
  await this.tweetService.addTweet(req.user, text)
  reply.code(204)
}

async function getTwitterHandler (req, reply) {
  return this.tweetService.fetchTweets([req.user._id])
}

async function getUserTweetsHandler (req, reply) {
  const userIds = req.params.userIds.split(',')
  return this.tweetService.fetchTweets(userIds)
}
