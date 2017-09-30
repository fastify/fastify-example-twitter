'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')

const sget = require('simple-get')

module.exports = fp(function (fastify, opts, next) {
  assert.ok(opts.USER_MICROSERVICE_BASE_URL, '"USER_MICROSERVICE_BASE_URL" must be a string')

  fastify.decorate('userClient', {
    getMe: function (req) {
      return new Promise(function (resolve, reject) {
        sget.concat({
          url: `${opts.USER_MICROSERVICE_BASE_URL}/api/user/me`,
          method: 'GET',
          headers: {
            authorization: req.req.headers.authorization
          },
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
