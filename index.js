'use strict'

const path = require('path')
const serie = require('fastseries')()

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

function registerSwagger (unused, next) {
  this.register(require('fastify-swagger'), swaggerOption, next)
}
function registerUser (unused, next) {
  this.register(require('./user'), { prefix: '/api/user' }, next)
}
function registerTweet (unused, next) {
  this.register(require('./tweet'), { prefix: '/api/tweet' }, next)
}
function registerFollow (unused, next) {
  this.register(require('./follow'), { prefix: '/api/follow' }, next)
}
function registerTimeline (unused, next) {
  this.register(require('./timeline'), { prefix: '/api/timeline' }, next)
}
function registerStatic (unused, next) {
  this.register(require('fastify-static'), {
    root: path.join(__dirname, 'frontend', 'build'),
    prefix: '/'
  }, next)
}

module.exports = function (fastify, opts, next) {
  serie(
    fastify,
    [
      registerSwagger,
      registerUser,
      registerTweet,
      registerFollow,
      registerTimeline,
      registerStatic
    ],
    opts,
    next
  )
}
