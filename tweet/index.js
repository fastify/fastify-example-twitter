'use strict'

const fp = require('fastify-plugin')

const {
  tweet: tweetSchema,
  getTweets: getTweetsSchema
} = require('./schemas')
const TweetService = require('./TweetService')

module.exports = async function (fastify, opts) {
  // See user/index.js for some little explainations
  fastify.register(require('fastify-env'), {
    schema: {
      type: 'object',
      required: [ 'TWEET_MONGO_URL', 'USER_MICROSERVICE_BASE_URL' ],
      properties: {
        TWEET_MONGO_URL: { type: 'string', default: 'mongodb://localhost/tweet' },
        USER_MICROSERVICE_BASE_URL: { type: 'string', default: 'http://localhost:3001' }
      }
    },
    data: opts
  })

  fastify.register(async function (fastify, opts) {
    fastify.register(require('fastify-mongodb'), {
      url: fastify.config.TWEET_MONGO_URL
    })

    fastify.register(fp(async function decorateWithTweetCollection (fastify, opts) {
      fastify.decorate('tweetCollection', fastify.mongo.db.collection('tweets'))
    }))

    fastify.register(async function (fastify, opts) {
      require('./mongoCollectionSetup')(fastify.mongo.db, fastify.tweetCollection)
    })

    fastify.register(fp(async function decorateWithTweetService (fastify, opts) {
      const tweetService = new TweetService(fastify.tweetCollection)
      fastify.decorate('tweetService', tweetService)
    }))

    fastify.register(require('../userClient'), fastify.config)

    fastify.register(registerRoutes)
  })
}

async function registerRoutes (fastify, opts) {
  const { tweetService, userClient } = fastify
  const { ObjectId } = fastify.mongo

  fastify.addHook('preHandler', async function (req, reply) {
    try {
      req.user = await userClient.getMe(req)
      req.user._id = ObjectId.createFromHexString(req.user._id)
    } catch (e) {
      if (!reply.context.config.allowUnlogged) {
        throw e
      }
    }
  })

  fastify.post('/', tweetSchema, async function (req, reply) {
    const { text } = req.body
    await tweetService.addTweet(req.user, text)
    reply.code(204)
  })

  fastify.get('/', async function (req, reply) {
    const tweets = await tweetService.fetchTweets([req.user._id])
    return tweets
  })

  fastify.get('/:userIds', getTweetsSchema, async function (req, reply) {
    const userIds = req.params.userIds.split(',').map(id => ObjectId.createFromHexString(id))
    const tweets = await tweetService.fetchTweets(userIds)
    return tweets
  })
}
