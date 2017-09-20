'use strict'

module.exports = function (db, tweetCollection, next) {
  const {name: collectionName} = tweetCollection.s

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

      tweetCollection.createIndex({ user: 1 }, next)
    })
  })
}
