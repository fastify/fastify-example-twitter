'use strict'

function follow (followService, meId, otherId) {
  return Promise.all([
    new Promise(function (resolve, reject) {
      followService.redisClient.zadd(`following:${meId}`, Date.now(), otherId, function (err, result) {
        if (err) return reject(err)
        resolve(result)
      })
    }),
    new Promise(function (resolve, reject) {
      followService.redisClient.zadd(`followers:${otherId}`, Date.now(), meId, function (err, result) {
        if (err) return reject(err)
        resolve(result)
      })
    })
  ])
}

function unfollow (followService, meId, otherId) {
  return Promise.all([
    new Promise(function (resolve, reject) {
      followService.redisClient.zrem(`following:${meId}`, otherId, function (err, result) {
        if (err) return reject(err)
        resolve(result)
      })
    }),
    new Promise(function (resolve, reject) {
      followService.redisClient.zrem(`followers:${otherId}`, meId, function (err, result) {
        if (err) return reject(err)
        resolve(result)
      })
    })
  ])
}

function getFollowing (followService, meId) {
  return new Promise(function (resolve, reject) {
    followService.redisClient.zrange(`following:${meId}`, 0, -1, function (err, result) {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

function getFollowers (followService, otherId) {
  return new Promise(function (resolve, reject) {
    followService.redisClient.zrange(`followers:${otherId}`, 0, -1, function (err, result) {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

class FollowService {
  constructor (redisClient) {
    this.redisClient = redisClient
  }

  follow (meId, otherId) {
    return follow(this, meId, otherId)
  }

  unfollow (meId, otherId) {
    return unfollow(this, meId, otherId)
  }

  getFollowing (meId) {
    return getFollowing(this, meId)
  }

  getFollowers (otherId) {
    return getFollowers(this, otherId)
  }
}

module.exports = FollowService
