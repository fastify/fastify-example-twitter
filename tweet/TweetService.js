'use strict'

class TweetService {
  constructor (tweetCollection) {
    this.tweetCollection = tweetCollection
  }

  async fetchTweets (userId) {
    const tweets = await this.tweetCollection.find({
      'user._id': userId
    }).sort({createdAt: -1}).toArray()
    return tweets
  }

  async addTweet (user, text) {
    await this.tweetCollection.insert({
      user,
      text,
      createdAt: new Date()
    })
  }
}

module.exports = TweetService
