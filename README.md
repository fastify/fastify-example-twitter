# Fastify twitter clone

The aim of this project is to show how `fastify` can be used.

**NB:** This project should be considered WIP and it does not reflect the best way we think fastify should be used, but it's rather an experiment to help driving fastify.

## Run

### Pseudo-production
```bash
# build frontend
cd frontend && npm build && cd ..
# start backend
npm start
```

### Development
```bash
# start frontend server
cd frontend && npm start
# start backend
npm start # in another terminal
```

## Backend

### Architecture

```

+------+   +-------+   +--------+  +----------+
|      |   |       |   |        |  |          |
| user |   | tweet |   | follow |  | timeline |
|      |   |       |   |        |  |          |
+------+   +-------+   +--------+  +----------+
   |           |           |            |
+---------------------------------------------+
|                                             |
|                    fastify                  |
|                                             |
+---------------------------------------------+

```

The backend is splitted into plugins:
- *user*: user authentication / user database
- *tweet*: tweet storage
- *follow*: follow storage
- *timeline*: timeline for homepage
- **Client*: clients to connect to other services

Thankfully to `fastify-env`, each plugin describes the own configuration dependency and it's completely independent!

`fastify-swagger` plugin is used to provide the swagger file.

All plugins use `fastify-mongodb` for the data persistence.
For the follow plugin the data is stored in redis thankfully to `fastify-redis`.

Each plugins has the same structure:
- `mongoCollectionSetup.js` that adds [mongodb schema validator](https://docs.mongodb.com/manual/core/document-validation/) and the indexes if needed.
- `schemas.js` that describes the [`fastify` schemas](https://github.com/fastify/fastify/blob/master/docs/Validation-And-Serialize.md)
- `*Service.js` that implements the plugin business logic
- `index.js` that exports the routes as a [`fastify` plugin](https://github.com/fastify/fastify/blob/master/docs/Plugins.md) and builds the setup

The communication between the plugin, some HTTP requests are made internally.
The user authentication is made through JSON Web Token using `fastify-jwt`.
This token is used to identify the user between plugins.

### User plugin

This plugin registers some APIs in order to register, login, search and get a profile for an user

### Tweet plugin

This plugin stores the tweets and allows you to retrieve the tweets of an user.

### Follow plugin

This plugin tracks the following and the followers implementing the flow explained [here](https://redis.io/topics/twitter-clone)

### Timeline plugin

This plugin aggregates informations from `tweet` and `follow` plugin in order to return the tweet timeline

## Frontend

The frontend side has been done only to show a simple UI for avoiding the manual curls.

It is built using `react` + `redux` stack.

No UX or UI study are made (please PR!)


## Split for building microservices

**TODO**: Waiting for docker compose!

## TODO

- [x] Search users
- [x] Timeline
- [x] Follow microservices for following and unfollowing other users
- [ ] Better test
- [ ] Better README.md
- [ ] Use Docker compose
- [ ] Use `fastify-react` for react serve side rendering
- [x] Better UI
- [ ] Even better UI
