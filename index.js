'use strict'

const path = require('path')

const swaggerOption = {
  swagger: {
    info: {
      title: 'Test swagger',
      description: 'testing the fastify swagger api',
      version: '0.1.0'
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
}

module.exports = async function (fastify, opts) {
  fastify
    .register(require('./user'), { prefix: '/api/user' })
    .register(require('./tweet'), { prefix: '/api/tweet' })
    .register(require('./follow'), { prefix: '/api/follow' })
    .register(require('./timeline'), { prefix: '/api/timeline' })
    .register(require('fastify-swagger'), swaggerOption)
    .register(require('fastify-static'), {
      root: path.join(__dirname, 'frontend', 'build'),
      prefix: '/'
    })
}
