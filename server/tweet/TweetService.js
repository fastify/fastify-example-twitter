'use strict'

class TweetService {
  constructor (tweetCollection) {
    this.tweetCollection = tweetCollection
  }

  async fetchTweets (user) {
    const tweets = await this.tweetCollection.find({
      'user._id': user._id
    }).toArray()
    return tweets
  }

  async addTweet (user, text) {
    const writeResult = await this.tweetCollection.insert({
      user,
      text,
      createdAt: new Date()
    })

    return writeResult
  }
}

module.exports = TweetService
