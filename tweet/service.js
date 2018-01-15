'use strict'

function convertUserIdToStringInTweet (t) {
  t.user._id = t.user._id.toString('hex')
  return t
}

class TweetService {
  constructor (tweetCollection) {
    this.tweetCollection = tweetCollection
  }

  async fetchTweets (userIds) {
    const tweets = await this.tweetCollection.find({
      'user._id': { $in: userIds }
    }).sort({createdAt: -1}).toArray()
    return tweets.map(convertUserIdToStringInTweet)
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
