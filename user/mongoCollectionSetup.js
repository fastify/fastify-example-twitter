'use strict'

module.exports = async function (db, userCollection) {
  await db.createCollection(userCollection.s.name)

  await db.command({
    'collMod': userCollection.s.name,
    validator: {
      username: { $type: 'string' },
      password: { $type: 'string' }
    }
  })

  await userCollection.createIndex({ username: 1 }, {unique: true})
}
