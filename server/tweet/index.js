'use strict'

const serie = require('fastseries')()

const {
  tweet: tweetSchema
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
      decorateWithUserClient,
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
  this.register(require('./mongoCollectionSetup'), done)
}

function decorateWithTweetService (a, done) {
  const tweetService = new TweetService(this.tweetCollection)
  this.decorate('tweetService', tweetService)
  done()
}

const request = require('request-promise-native')
function decorateWithUserClient (a, done) {
  this.decorate('userClient', {
    getMe: (req) => {
      return request({
        uri: `${this.config.USER_MICROSERVICE_BASE_URL}/api/me`,
        method: 'GET',
        headers: {
          authorization: req.req.headers.authorization
        },
        json: true
      })
    }
  })

  done()
}

function registerRoutes (a, done) {
  const { tweetService, userClient } = this

  this.addHook('preHandler', async function (req, reply, done) {
    try {
      req.user = await userClient.getMe(req)
    } catch (e) {
      return done(e)
    }
    done()
  })

  this.post('/api/tweet', tweetSchema, async function (req, reply) {
    const { text } = req.body
    await tweetService.addTweet(req.user, text)
    reply.code(204)
  })

  this.get('/api/tweet', async function (req, reply) {
    const tweets = await tweetService.fetchTweets(req.user)
    return tweets
  })

  done()
}
