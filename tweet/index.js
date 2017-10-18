'use strict'

const fp = require('fastify-plugin')

const {
  tweet: tweetSchema,
  getTweets: getTweetsSchema
} = require('./schemas')
const TweetService = require('./TweetService')

module.exports = function (fastify, opts, next) {
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

  fastify.register(function (fastify, opts, done) {
    fastify.register(require('fastify-mongodb'), {
      url: fastify.config.TWEET_MONGO_URL
    })

    fastify.register(fp(function decorateWithTweetCollection (fastify, opts, done) {
      fastify.decorate('tweetCollection', fastify.mongo.db.collection('users'))
      done()
    }))

    fastify.register(function (fastify, opts, done) {
      require('./mongoCollectionSetup')(fastify.mongo.db, fastify.tweetCollection, done)
    })

    fastify.register(fp(function decorateWithTweetService (fastify, opts, done) {
      const tweetService = new TweetService(fastify.tweetCollection)
      fastify.decorate('tweetService', tweetService)
      done()
    }))

    fastify.register(require('../userClient'), fastify.config, done)

    fastify.register(registerRoutes)

    done()
  })

  next()
}

function registerRoutes (fastify, opts, done) {
  const { tweetService, userClient } = fastify
  const { ObjectId } = fastify.mongo

  fastify.addHook('preHandler', async function (req, reply, done) {
    try {
      req.user = await userClient.getMe(req)
      req.user._id = ObjectId.createFromHexString(req.user._id)
    } catch (e) {
      if (!reply.store.config.allowUnlogged) {
        return done(e)
      }
    }
    done()
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

  done()
}
