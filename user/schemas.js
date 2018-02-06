'use strict'

// This file contains the fastify input and output schema

const userProfileOutput = {
  type: 'object',
  require: [ '_id', 'username' ],
  properties: {
    _id: { type: 'string' },
    username: { type: 'string' }
  }
}

const registration = {
  schema: {
    schema: {
      // This jsonschema will be used for data validation
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
        // The 200 body response is described
        // by the following schema
        200: {
          type: 'object',
          required: [ 'userId' ],
          properties: {
            userId: { type: 'string' }
          },
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
        items: userProfileOutput
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
    },
    response: {
      200: userProfileOutput
    }
  }
}

module.exports = {
  registration,
  login,
  search,
  getProfile
}
