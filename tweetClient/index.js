'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')

const got = require('got')

module.exports = fp(function (fastify, opts, next) {
  assert.ok(opts.FOLLOW_MICROSERVICE_BASE_URL, '"TWEET_MICROSERVICE_BASE_URL" must be a string')

  fastify.decorate('tweetClient', {
    getTweets: function (userIds) {
      return got(`${opts.TWEET_MICROSERVICE_BASE_URL}/api/tweet/${userIds.join(',')}`, {
        method: 'GET',
        json: true,
        followRedirect: false
      })
        .then(r => r.body)
    }
  })

  next()
})
