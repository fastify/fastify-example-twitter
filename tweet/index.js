'use strict'

const serie = require('fastseries')()

const {
  tweet: tweetSchema,
  getTweets: getTweetsSchema
} = require('./schemas')
const TweetService = require('./TweetService')

module.exports = function (fastify, opts, next) {
  // See user/index.js for some little explainations
  serie(
    fastify,
    [
      registerEnv,
      registerMongo,
      decorateWithTweetCollection,
      registerMongoSetup,
      decorateWithTweetService,
      registerUserClient,
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
      required: [ 'TWEET_MONGO_URL', 'USER_MICROSERVICE_BASE_URL' ],
      properties: {
        TWEET_MONGO_URL: { type: 'string', default: 'mongodb://localhost/tweet' },
        USER_MICROSERVICE_BASE_URL: { type: 'string', default: 'http://localhost:3001' }
      }
    },
    data: data
  }
  this.register(require('fastify-env'), envOpts, done)
}

function registerMongo (a, done) {
  const mongoDbOpts = {
    url: this.config.TWEET_MONGO_URL
  }
  this.register(require('fastify-mongodb'), mongoDbOpts, done)
}

function decorateWithTweetCollection (a, done) {
  this.decorate('tweetCollection', this.mongo.db.collection('users'))
  done()
}

function registerMongoSetup (a, done) {
  require('./mongoCollectionSetup')(this.mongo.db, this.tweetCollection, done)
}

function decorateWithTweetService (a, done) {
  const tweetService = new TweetService(this.tweetCollection)
  this.decorate('tweetService', tweetService)
  done()
}

function registerUserClient (a, done) {
  this.register(require('../userClient'), this.config, done)
}

function registerRoutes (a, done) {
  const { tweetService, userClient } = this
  const { ObjectId } = this.mongo

  this.addHook('preHandler', async function (req, reply, done) {
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

  this.post('/', tweetSchema, async function (req, reply) {
    const { text } = req.body
    await tweetService.addTweet(req.user, text)
    reply.code(204)
  })

  this.get('/', async function (req, reply) {
    const tweets = await tweetService.fetchTweets([req.user._id])
    return tweets
  })

  this.get('/:userIds', getTweetsSchema, async function (req, reply) {
    const userIds = req.params.userIds.split(',').map(id => ObjectId.createFromHexString(id))
    const tweets = await tweetService.fetchTweets(userIds)
    return tweets
  })

  done()
}
