'use strict'

const DUPLICATE_KEY_ERROR_CODE = 11000

const errors = require('../errors')

class UserService {
  constructor (userCollection) {
    this.userCollection = userCollection
  }

  async register (username, password) {
    let writeResult
    try {
      writeResult = await this.userCollection.insertOne({ username, password })
    } catch (e) {
      if (e.code === DUPLICATE_KEY_ERROR_CODE) {
        throw new Error(errors.USERNAME_IS_NOT_AVAILABLE)
      }
      throw e
    }

    if (writeResult.insertedCount !== 1) throw new Error('unknown error')

    return writeResult.insertedId
  }

  async login (username, password) {
    const users = await this.userCollection.find({ username, password }, { projection: {password: 0} }).toArray()
    const user = users[0]

    if (!user) throw new Error(errors.WRONG_CREDENTIAL)

    return user
  }

  getProfile (_id) {
    return this.userCollection.findOne({ _id }, { projection: {password: 0} })
  }

  async search (searchString) {
    const query = {
      username: { $regex: searchString }
    }
    const users = await this.userCollection.find(query, { projection: {password: 0} }).limit(5).toArray()
    return users
  }

  async ensureIndexes (db) {
    await db.command({
      'collMod': this.userCollection.collectionName,
      validator: {
        username: { $type: 'string' },
        password: { $type: 'string' }
      }
    })
    await this.userCollection.createIndex({ username: 1 }, { unique: true })
  }
}

module.exports = UserService
