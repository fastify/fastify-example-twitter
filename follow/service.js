'use strict'

function execRedis (redisClient, method, args) {
  return new Promise(function (resolve, reject) {
    args.push(function (err, result) {
      if (err) return reject(err)
      resolve(result)
    })
    redisClient[method].apply(redisClient, args)
  })
}

function follow (redisClient, meId, otherId) {
  return Promise.all([
    execRedis(redisClient, 'zadd', [`following:${meId}`, Date.now(), otherId]),
    execRedis(redisClient, 'zadd', [`followers:${otherId}`, Date.now(), meId])
  ])
}

function unfollow (redisClient, meId, otherId) {
  return Promise.all([
    execRedis(redisClient, 'zrem', [`following:${meId}`, otherId]),
    execRedis(redisClient, 'zrem', [`followers:${otherId}`, meId])
  ])
}

function getFollowing (redisClient, meId) {
  return execRedis(redisClient, 'zrange', [`following:${meId}`, 0, -1])
}

function getFollowers (redisClient, otherId) {
  return execRedis(redisClient, 'zrange', [`followers:${otherId}`, 0, -1])
}

class FollowService {
  constructor (redisClient) {
    this.redisClient = redisClient
  }

  follow (meId, otherId) {
    return follow(this.redisClient, meId + '', otherId + '')
  }

  unfollow (meId, otherId) {
    return unfollow(this.redisClient, meId + '', otherId + '')
  }

  getFollowing (meId) {
    return getFollowing(this.redisClient, meId + '')
  }

  getFollowers (otherId) {
    return getFollowers(this.redisClient, otherId + '')
  }
}

module.exports = FollowService
