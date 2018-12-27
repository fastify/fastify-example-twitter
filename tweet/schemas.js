'use strict'

const tweetObject = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    user: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        username: { type: 'string' }
      }
    },
    text: { type: 'string' }
  }
}

const tweet = {
  body: {
    type: 'object',
    required: [ 'text' ],
    properties: {
      text: { type: 'string', minLength: 1, maxLength: 144 }
    },
    additionalProperties: false
  }
}

const getUserTweets = {
  params: {
    type: 'object',
    required: [ 'userIds' ],
    properties: {
      userIds: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}(,[0-9a-fA-F]{24})?'
      }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: 'array',
      items: tweetObject
    }
  }
}

const getTweets = {
  response: {
    200: {
      type: 'array',
      items: tweetObject
    }
  }
}

module.exports = {
  tweet,
  getTweets,
  getUserTweets
}
