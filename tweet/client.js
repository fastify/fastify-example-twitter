'use strict'

module.exports = function (tweetService) {
  return {
    getTweets (userIds) {
      return tweetService.fetchTweets(userIds)
    }
  }
}
