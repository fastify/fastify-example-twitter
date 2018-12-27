'use strict'

const {
  follow: followSchema,
  unfollow: unfollowSchema,
  followers: followersSchema
} = require('./schemas')

module.exports = async function (fastify, opts) {
  fastify.addHook('preHandler', fastify.authPreHandler)

  fastify
    .post('/follow', followSchema, followHandler)
    .post('/unfollow', unfollowSchema, unfollowHandler)
    .get('/following/me', getMyFollowingHandler)
    .get('/followers/me', getMyFollowersHandler)
    .get('/following/:userId', getUserFollowingHandler)
    .get('/followers/:userId', followersSchema, getUserFollowersHandler)
}

module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'redis',
      'authPreHandler'
    ]
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
