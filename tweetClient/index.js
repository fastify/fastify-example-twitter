'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')

const sget = require('simple-get')

module.exports = fp(function (fastify, opts, next) {
  assert.ok(opts.FOLLOW_MICROSERVICE_BASE_URL, '"TWEET_MICROSERVICE_BASE_URL" must be a string')

  fastify.decorate('tweetClient', {
    getTweets: function (userIds) {
      return new Promise(function (resolve, reject) {
        sget.concat({
          url: `${opts.TWEET_MICROSERVICE_BASE_URL}/api/tweet/${userIds.join(',')}`,
          method: 'GET',
          json: true
        }, function (err, response, body) {
          if (err) return reject(err)
          resolve(body)
        })
      })
    }
  })

  next()
})
