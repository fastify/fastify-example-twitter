'use strict'

const registration = {
  schema: {
    schema: {
      description: 'post some data',
      tags: ['user', 'code'],
      summary: 'qwerty',
      body: {
        type: 'object',
        required: [ 'username', 'password' ],
        properties: {
          username: {
            type: 'string'
          },
          password: {
            type: 'string'
          }
        },
        additionalProperties: false
      },
      response: {
        200: {
          type: 'object',
          required: [ ],
          properties: { },
          additionalProperties: false
        }
      }
    }
  }
}

const login = {
  schema: {
    body: {
      type: 'object',
      require: [ 'username', 'password' ],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' }
      },
      additionalProperties: false
    },
    response: {
      200: {
        type: 'object',
        require: [ 'jwt' ],
        properties: {
          jwt: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }
}

module.exports = {
  registration,
  login
}
