'use strict'

class TimelineService {
  constructor (followClient, tweetClient) {
    this.followClient = followClient
    this.tweetClient = tweetClient
  }

  async getTimeline (userId) {
    const followings = await this.followClient.getMyFollowing(userId)
    followings.push(userId.toString())
    const tweets = await this.tweetClient.getTweets(followings)
    return tweets
  }
}

module.exports = TimelineService
