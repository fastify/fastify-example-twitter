'use strict'

module.exports = function (followService) {
  return {
    getMyFollowing (_id) {
      return followService.getFollowing(_id)
    }
  }
}
