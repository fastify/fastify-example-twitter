'use strict'

module.exports = async function (db, tweetCollection) {
  const {name: collectionName} = tweetCollection.s

  await db.createCollection(collectionName)

  await db.command({
    'collMod': collectionName,
    validator: {
      user: { $type: 'object' },
      'user._id': { $type: 'objectId' },
      text: { $type: 'string' }
    }
  })

  await tweetCollection.createIndex({ 'user._id': 1 })
}
