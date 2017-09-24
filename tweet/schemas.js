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

module.exports = {
  tweet
}
