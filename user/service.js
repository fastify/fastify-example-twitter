'use strict'

const Boom = require('boom')
const DUPLICATE_KEY_ERROR_CODE = 11000

class UserService {
  constructor (userCollection, jwt) {
    this.userCollection = userCollection
    this.jwt = jwt
  }

  async register (username, password) {
    let writeResult
    try {
      writeResult = await this.userCollection.insert({ username, password })
    } catch (e) {
      if (e.code === DUPLICATE_KEY_ERROR_CODE) {
        throw Boom.badRequest('Username not available')
      }
      throw Boom.wrap(e)
    }

    if (writeResult.insertedCount !== 1) throw Boom.badRequest('Boh...')

    return writeResult.insertedIds[0]
  }

  async login (username, password) {
    const users = await this.userCollection.find({ username, password }, { projection: {password: 0} }).toArray()
    const user = users[0]

    if (!user) throw Boom.badData('Wrong credentials')

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
}

module.exports = UserService
