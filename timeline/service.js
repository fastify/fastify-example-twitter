'use strict'

class TimelineService {
  constructor (followClient, tweetClient) {
    this.followClient = followClient
    this.tweetClient = tweetClient
  }

  async getTimeline (userId) {
    const followerIds = await this.followClient.getFollowing(userId)
    followerIds.push(userId)
    return this.tweetClient.fetchTweets(followerIds)
  }
}

module.exports = TimelineService
