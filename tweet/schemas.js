'use strict'

const tweet = {
  schema: {
    body: {
      type: 'object',
      required: [ 'text' ],
      properties: {
        text: { type: 'string', minLength: 1, maxLength: 144 }
      },
      additionalProperties: false
    }
  }
}

const getTweets = {
  schema: {
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
    }
  },
  config: { allowUnlogged: true }
}

module.exports = {
  tweet,
  getTweets
}
