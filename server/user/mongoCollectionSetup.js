'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  const { db } = fastify.mongo

  db.createCollection(fastify.userCollection.s.name, err => {
    if (err) return next(err)

    db.command({
      'collMod': fastify.userCollection.s.name,
      validator: {
        username: { $type: 'string' },
        password: { $type: 'string' }
      }
    }, err => {
      if (err) return next(err)

      fastify.userCollection.createIndex({ username: 1 }, {unique: true}, next)
    })
  })
})
