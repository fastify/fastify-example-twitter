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

const search = {
  schema: {
    querystring: {
      type: 'object',
      require: [ 'search' ],
      properties: {
        search: { type: 'string' }
      },
      additionalProperties: false
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          require: [ '_id', 'username' ],
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' }
          },
          additionalProperties: false
        }
      }
    }
  }
}

const getProfile = {
  schema: {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'string',
          pattern: '^[0-9a-fA-F]{24}'
        }
      }
    }
  }
}

module.exports = {
  registration,
  login,
  search,
  getProfile
}
