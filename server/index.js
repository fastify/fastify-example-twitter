'use strict'

const path = require('path')

const fastify = require('fastify')({
  logger: {
    level: 'trace'
  }
})

fastify.register(require('fastify-swagger'), {
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
})

fastify.register(require('./user'), err => {
  if (err) throw err
})

fastify.register(require('./tweet'), err => {
  if (err) throw err
})

fastify.register(require('./follow'), err => {
  if (err) throw err
})

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '..', 'build'),
  prefix: '/'
})

fastify.listen(3001, err => {
  if (err) throw err
  fastify.swagger()
  console.log(`Server is up at http://localhost:${fastify.server.address().port}`)
})
