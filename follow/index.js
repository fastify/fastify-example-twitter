'use strict'

const fp = require('fastify-plugin')

const {
  follow: followSchema,
  unfollow: unfollowSchema,
  followers: followersSchema
} = require('./schemas')
const FollowService = require('./service')

const FollowClient = require('./client')

// See users/index.js for more explainations!
module.exports = fp(async function (fastify, opts) {
  const followService = new FollowService(fastify.redis)

  fastify.decorate('followClient', new FollowClient(followService))

  fastify.register(async function (fastify) {
    fastify.decorate('followService', followService)

    fastify.addHook('preHandler', preHandler)
    fastify.post('/follow', followSchema, followHandler)
    fastify.post('/unfollow', unfollowSchema, unfollowHandler)
    fastify.get('/following/me', getMyFollowingHandler)
    fastify.get('/followers/me', getMyFollowersHandler)
    fastify.get('/following/:userId', { config: { allowUnlogged: true } }, getUserFollowingHandler)
    fastify.get('/followers/:userId', followersSchema, getUserFollowersHandler)
  }, { prefix: opts.prefix })
}, {
  decorators: {
    fastify: [
      'redis',
      'userClient',
      'getUserIdFromRequest',
      'transformStringIntoObjectId'
    ]
  }
})

async function preHandler (req, reply) {
  try {
    const userIdString = this.getUserIdFromRequest(req)
    const userId = this.transformStringIntoObjectId(userIdString)
    req.user = await this.userClient.getMe(userId)
  } catch (e) {
    if (!reply.context.config.allowUnlogged) {
      throw e
    }
  }
}

async function followHandler (req, reply) {
  const { userId } = req.body
  await this.followService.follow(req.user._id, userId)
  reply.code(204)
}

async function unfollowHandler (req, reply) {
  const { userId } = req.body
  await this.followService.unfollow(req.user._id, userId)
  reply.code(204)
}

function getMyFollowingHandler (req, reply) {
  return this.followService.getFollowing(req.user._id)
}

function getMyFollowersHandler (req, reply) {
  return this.followService.getFollowers(req.user._id)
}

function getUserFollowingHandler (req, reply) {
  return this.followService.getFollowing(req.params.userId)
}

function getUserFollowersHandler (req, reply) {
  return this.followService.getFollowers(req.params.userId)
}
