'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')

const got = require('got')

module.exports = fp(async function (fastify, opts) {
  assert.ok(opts.FOLLOW_MICROSERVICE_BASE_URL, '"FOLLOW_MICROSERVICE_BASE_URL" must be a string')

  fastify.decorate('followClient', {
    getMyFollowing: function (userId) {
      return got(`${opts.FOLLOW_MICROSERVICE_BASE_URL}/api/follow/following/${userId}`, {
        method: 'GET',
        json: true,
        followRedirect: false
      })
        .then(r => r.body)
    }
  })
})
