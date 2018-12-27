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
    await this.tweetCollection.insertOne({
      user,
      text,
      createdAt: new Date()
    })
  }

  async ensureIndexes (db) {
    await db.command({
      'collMod': this.tweetCollection.collectionName,
      validator: {
        user: { $type: 'object' },
        'user._id': { $type: 'string' },
        'user.username': { $type: 'string' },
        text: { $type: 'string' }
      }
    })
    await this.tweetCollection.createIndex({ 'user._id': 1 })
  }
}

module.exports = TweetService
