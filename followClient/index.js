'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')

const sget = require('simple-get')

module.exports = fp(function (fastify, opts, next) {
  assert.ok(opts.FOLLOW_MICROSERVICE_BASE_URL, '"FOLLOW_MICROSERVICE_BASE_URL" must be a string')

  fastify.decorate('followClient', {
    getMyFollowing: function (userId) {
      return new Promise(function (resolve, reject) {
        sget.concat({
          url: `${opts.FOLLOW_MICROSERVICE_BASE_URL}/api/follow/following/${userId}`,
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
