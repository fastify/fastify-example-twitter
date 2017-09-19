'use strict'

module.exports = function (db, userCollection, next) {
  db.createCollection(userCollection.s.name, err => {
    if (err) return next(err)

    db.command({
      'collMod': userCollection.s.name,
      validator: {
        username: { $type: 'string' },
        password: { $type: 'string' }
      }
    }, err => {
      if (err) return next(err)

      userCollection.createIndex({ username: 1 }, {unique: true}, next)
    })
  })
}
