'use strict'

class UserClient {
  constructor (userService) {
    this._userService = userService
  }

  getMe (_id) {
    return this._userService.getProfile(_id)
  }
}

module.exports = UserClient
