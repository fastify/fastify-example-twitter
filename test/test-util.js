'use strict'

const PASSWORD = 'the-password'

async function registerUsers (t, fastify, usernames) {
  return Promise.all(usernames.map(async username => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/user/register',
      headers: {
        'Content-type': 'application/json'
      },
      payload: JSON.stringify({
        username: username,
        password: PASSWORD
      })
    })
    t.equal(200, res.statusCode, res.payload)

    return JSON.parse(res.payload)
  }))
}

async function login (t, fastify, username) {
  const res = await fastify.inject({
    method: 'POST',
    url: '/api/user/login',
    headers: {
      'Content-type': 'application/json'
    },
    payload: JSON.stringify({
      username: username,
      password: PASSWORD
    })
  })
  t.equal(200, res.statusCode, res.payload)

  return JSON.parse(res.payload).jwt
}

async function createTweet (t, fastify, jwt, text) {
  let res = await fastify.inject({
    method: 'POST',
    url: '/api/tweet',
    headers: {
      'Authorization': 'Bearer ' + jwt
    },
    payload: { text }
  })
  t.equal(res.statusCode, 204, res.payload)
}

async function follow (t, fastify, jwt, friendUserId) {
  const followMyFriendResponse = await fastify.inject({
    method: 'POST',
    url: '/api/follow/follow',
    headers: {
      'Authorization': 'Bearer ' + jwt
    },
    payload: {
      userId: friendUserId
    }
  })
  t.equal(204, followMyFriendResponse.statusCode, followMyFriendResponse.payload)
}

module.exports = {
  registerUsers,
  login,
  createTweet,
  follow
}
