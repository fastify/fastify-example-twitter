'use strict'

const follow = {
  schema: {
    body: {
      type: 'object',
      required: [ 'userId' ],
      properties: {
        userId: { type: 'string' }
      },
      additionalProperties: false
    }
  }
}

const unfollow = {
  schema: {
    body: {
      type: 'object',
      required: [ 'userId' ],
      properties: {
        userId: { type: 'string' }
      },
      additionalProperties: false
    }
  }
}

const followers = {
  schema: {
    params: {
      type: 'object',
      required: [ 'userId' ],
      properties: {
        userId: { type: 'string' }
      },
      additionalProperties: false
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    }
  }
}

module.exports = {
  follow,
  unfollow,
  followers
}
