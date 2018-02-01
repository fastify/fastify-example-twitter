'use strict'

class TweetClient {
  constructor (tweetService) {
    this._tweetService = tweetService
  }

  getTweets (userIds) {
    return this._tweetService.fetchTweets(userIds)
  }
}

module.exports = TweetClient
