# Fastify tweeter clone

The aim of this project is to show how `fastify` can be used.

**NB:** I don't pretend to teach you something: this is my personal `fastify` usage!

## Run

### Pseudo-production
```bash
# build frontend
npm build
# start backend
cd server && npm start
```

### Development
```bash
# start frontend server
npm start
# start backend
cd server && npm start # in another terminal
```

## Backend

The backend is splitted into two plugins:
- *user*: user authentication / user database
- *tweet*: tweet storage

Thankfully to `fastify-env`, each plugin describes the own configuration dependency and it's completely independent!

`fastify-swagger` plugin is used to provide the swagger file.

All plugins use `fastify-mongodb` for the data persistence.

### User plugin

This plugin exports 3 APIs: `/api/register`, `/api/login`, `/api/me`.

The user authentication is made using `fastify-jwt`. So the client in the browser side should use the json web token returned by `/api/login` for contacting the authenticated APIs.

`/api/me` returns all the public user properties.

### Tweet plugin

This plugin registers two APIs: `/api/tweet` in `GET` and `POST` for the tweet fetching and creation.

This plugin contacts the user plugin for checking the json web token.

## Frontend

The frontend side has been done only to show a simple UI for avoiding the manual curls.

It is built using `react` + `redux` stack.

No UX or UI study are made (please PR!)


## Split for build microservices

This code is designed to be splitted into multiple parts.
For simplicity we'll split it into two components:
- user
- tweet

```bash
# build frontend
npm build
npm -g install fastify-cli fastify
```

Shell1:
```bash
cd server
fastify --port 3005 user/index.js
```

Shell2:
```bash
cd server
fastify --port 3006 --custom 'USER_MICROSERVICE_BASE_URL=http://localhost:3005' tweet/index.js
```

Now you have spitted the code into multiple microservices without doing nothing!

## TODO

- [ ] Search users
- [ ] Follow microservices for following and unfollowing other users
- [ ] Better test
- [ ] Better README.md
- [ ] Provide a Dockerfile for serving static file when splitting into multiple microservices
- [ ] Use `fastify-react` for react serve side rendering