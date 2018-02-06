'use strict'

module.exports = function (userService) {
  return {
    getMe (_id) {
      return userService.getProfile(_id)
    }
  }
}
