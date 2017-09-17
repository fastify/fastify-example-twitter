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
  }

  async login (username, password) {
    const users = await this.userCollection.find({ username, password }, {password: 0}).toArray()
    const user = users[0]

    if (!user) throw Boom.badData('Wrong credentials')

    return this.jwt.sign(user)
  }

  async me (jwt) {
    try {
      this.jwt.verify(jwt)
    } catch (e) {
      throw Boom.unauthorized()
    }

    const { username } = this.jwt.decode(jwt)
    const users = await this.userCollection.find({ username }, {password: 0}).toArray()
    return users[0]
  }

  async search (searchString) {
    const query = {
      username: { $regex: searchString }
    }
    const users = await this.userCollection.find(query, {password: 0}).limit(5).toArray()
    return users
  }
}

module.exports = UserService
