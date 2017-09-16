'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  const { db } = fastify.mongo

  const {name: collectionName} = fastify.tweetCollection.s

  db.createCollection(collectionName, err => {
    if (err) return next(err)

    db.command({
      'collMod': collectionName,
      validator: {
        user: { $type: 'object' },
        text: { $type: 'string' }
      }
    }, err => {
      if (err) return next(err)

      fastify.tweetCollection.createIndex({ user: 1 }, next)
    })
  })
})
