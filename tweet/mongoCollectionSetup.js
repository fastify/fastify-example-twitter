'use strict'

module.exports = function (db, tweetCollection, next) {
  const {name: collectionName} = tweetCollection.s

  db.createCollection(collectionName, err => {
    if (err) return next(err)

    db.command({
      'collMod': collectionName,
      validator: {
        user: { $type: 'object' },
        'user._id': { $type: 'objectId' },
        text: { $type: 'string' }
      }
    }, err => {
      if (err) return next(err)

      tweetCollection.createIndex({ 'user._id': 1 }, next)
    })
  })
}
