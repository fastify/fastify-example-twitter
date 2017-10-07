'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')

const got = require('got')

module.exports = fp(function (fastify, opts, next) {
  assert.ok(opts.USER_MICROSERVICE_BASE_URL, '"USER_MICROSERVICE_BASE_URL" must be a string')

  fastify.decorate('userClient', {
    getMe: function (req) {
      if (!req.headers.authorization) {
        return Promise.reject(new Error('No authorization header found'))
      }
      return got(`${opts.USER_MICROSERVICE_BASE_URL}/api/user/me`, {
        method: 'GET',
        headers: {
          authorization: req.headers.authorization
        },
        json: true,
        followRedirect: false
      })
        .then(r => r.body)
    }
  })

  next()
})
