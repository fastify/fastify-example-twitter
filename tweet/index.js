'use strict'

const TWEET_COLLECTION_NAME = 'tweet'

const {
  tweet: tweetSchema,
  getTweets: getTweetsSchema
} = require('./schemas')
const TweetService = require('./service')

module.exports = async function (fastify, opts) {
  if (!fastify.mongo) throw new Error('`fastify.mongo` is undefined')
  if (!fastify.userClient) throw new Error('`fastify.userClient` is undefined')

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
  fastify.decorate('tweetService', tweetService)
  fastify.decorate('transformStringIntoObjectId', fastify.mongo.ObjectId.createFromHexString)

  fastify.addHook('preHandler', preHandler)
  fastify.post('/', tweetSchema, addTwitterHandler)
  fastify.get('/', getTwitterHandler)
  fastify.get('/:userIds', getTweetsSchema, getUserTweetsHandler)
}

async function preHandler (req, reply) {
  try {
    req.user = await this.userClient.getMe(req)
    req.user._id = this.transformStringIntoObjectId(req.user._id)
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
