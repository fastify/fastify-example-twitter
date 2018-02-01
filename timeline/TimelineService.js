'use strict'

class TimelineService {
  constructor (followClient, tweetClient, transformStringIntoObjectId) {
    this.followClient = followClient
    this.tweetClient = tweetClient
    this.transformStringIntoObjectId = transformStringIntoObjectId
  }

  async getTimeline (userId) {
    const followings = await this.followClient.getMyFollowing(userId)
    const followerIds = followings.map(this.transformStringIntoObjectId)
    followerIds.push(userId)
    return this.tweetClient.getTweets(followerIds)
  }
}

module.exports = TimelineService
