'use strict'

const fastify = require('fastify')()

fastify.register(require('fastify-mongodb'), {
  url: 'mongodb://localhost/db'
}, err => {
  if (err) throw err
})

fastify.register(function (fastify, opts, done) {
  setTimeout(() => {
    console.log('Registering GET /')
    fastify.post('/api/login', (req, reply) => reply.send({hello: 'world'}))
    done()
  }, 1000)
}, err => {
  if (err) throw err
})

fastify.listen(3001, function (err) {
  console.log(err, fastify.server.address())
  if (err) throw err
  console.log('Up at http://localhost:3000')

  // setTimeout(() => fastify.close(), 100)
})
