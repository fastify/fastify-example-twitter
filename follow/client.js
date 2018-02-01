'use strict'

class FollowClient {
  constructor (followService) {
    this._followService = followService
  }

  getMyFollowing (_id) {
    return this._followService.getFollowing(_id)
  }
}

module.exports = FollowClient
