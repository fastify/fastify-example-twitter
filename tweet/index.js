'use strict'

const TWEET_COLLECTION_NAME = 'tweet'

const fp = require('fastify-plugin')
const TweetClient = require('./client')

const {
  tweet: tweetSchema,
  getTweets: getTweetsSchema
} = require('./schemas')
const TweetService = require('./service')

// See users/index.js for more explainations!
module.exports = fp(async function (fastify, opts) {
  const db = fastify.mongo.db
  const tweetCollection = await db.createCollection(TWEET_COLLECTION_NAME)
  await db.command({
    'collMod': TWEET_COLLECTION_NAME,
    validator: {
      user: { $type: 'object' },
      'user._id': { $type: 'objectId' },
      text: { $type: 'string' }
    }
  })
  await tweetCollection.createIndex({ 'user._id': 1 })

  const tweetService = new TweetService(tweetCollection)
  fastify.decorate('tweetClient', new TweetClient(tweetService))

  fastify.register(async function (fastify) {
    fastify.decorate('tweetService', tweetService)

    fastify.addHook('preHandler', preHandler)
    fastify.post('/', tweetSchema, addTwitterHandler)
    fastify.get('/', getTwitterHandler)
    fastify.get('/:userIds', getTweetsSchema, getUserTweetsHandler)
  }, { prefix: opts.prefix })
}, {
  decorators: {
    fastify: [
      'mongo',
      'userClient',
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

async function addTwitterHandler (req, reply) {
  const { text } = req.body
  await this.tweetService.addTweet(req.user, text)
  reply.code(204)
}

async function getTwitterHandler (req, reply) {
  const tweets = await this.tweetService.fetchTweets([req.user._id])
  return tweets
}

async function getUserTweetsHandler (req, reply) {
  const userIds = req.params.userIds.split(',').map(id => this.transformStringIntoObjectId(id))
  const tweets = await this.tweetService.fetchTweets(userIds)
  return tweets
}
