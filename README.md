# Fastify twitter clone

The aim of this project is to show how `fastify` can be used.

**NB:** This project should be considered WIP and it does not reflect the best way we think fastify should be used, but it's rather an experiment to help driving fastify.

## Run

For running this project on your machine:
```bash
# terminal 1: Start frontend server
cd frontend && npm start
# terminal 2: start backend
npm start -- --log-level trace --port 3001
```

Open your browser at [http://localhost:3000](http://localhost:3000)

**NB** this project need to access a mongodb and a redis instance. If you haven't them, please consider to use docker.

## Backend

### Architecture

Fastify helps us to keep this segregation: the plugin system provides us a way to declare pieces of our business logic without exposing them to the whole application. If you looking for a guide to understand better how the plugin system works, please read this [Plugin Guide](https://www.fastify.dev/docs/latest/Plugins-Guide/)

So, the backend is splitted into plugins:
- *user*: user authentication / user database
- *tweet*: tweet storage
- *follow*: follow storage
- *timeline*: timeline for homepage

The last three modules have a `preHandler` hook to find which the user has made the request.

Each plugin has almost the same structure:
- `index.js` is the fastify binding
- `service.js` is the business logic
- `schemas.js` has the schemas used for http validation and serialization (See [`fastify` schemas](https://www.fastify.dev/docs/latest/Validation-and-Serialization/))

### User plugin

This plugin registers some APIs in order to register, login, search and get a profile for an user.

It uses `mongodb` to save users and exports a `userClient` to allow other plugins to access to an user profile.

### Tweet plugin

This plugin stores tweets and allows you to retrieve the tweets of an user.

It uses `mongodb` for storing the tweets and exports a client for tweets retrieving.

### Follow plugin

This plugin tracks the following and the followers implementing the flow explained [here](https://redis.io/topics/twitter-clone).

It uses `redis` for tracking which users follow the other ones and vice versa.

### Timeline plugin

This plugin aggregates informations from `tweet` and `follow` plugin in order to return the tweet timeline.

This plugin doesn't use any database to track that informations and uses tweetService and followService to build the response.

## Frontend

The frontend side has been done only to show a simple UI for avoiding the manual CURLs.

It is built using `react` + `redux` stack.

No UX or UI study are made (please PR!)

***Coming soon***

## TODO

- [x] Search users
- [x] Timeline
- [x] Follow microservices for following and unfollowing other users
- [x] Better test
- [ ] Better README.md
- [x] Use Docker compose
- [ ] Use `fastify-react` for react serve side rendering
- [x] Better UI
- [ ] Even better UI
