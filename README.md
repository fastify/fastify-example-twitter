# Fastify twitter clone

The aim of this project is to show how `fastify` can be used.

**NB:** This project should be considered WIP and it does not reflect the best way we think fastify should be used, but it's rather an experiment to help driving fastify.

## Run

### Pseudo-production
```bash
# build frontend
cd frontend && npm run build && cd ..
# start backend
npm start -- --log-level trace --port 3001
```

Open your browser at [http://localhost:3001](http://localhost:3001)

### Development
```bash
# start frontend server
cd frontend && npm start
# start backend
npm start -- --log-level trace --port 3001 # in another terminal
```

Open your browser at [http://localhost:3000](http://localhost:3000)

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
- *___Client*: clients to connect to other services

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

Once your code is written, you'd like to split it into many services for scaling purpose.

`fastify` allows to you to split your code without doing any changes!
How? When the code is built, `fastify` eases the developer to keep different logics separated thankfully to the encapsulation

First of all, let's build the frontend:
```sh
cd frontend
npm run build
cd ..
```

Then,
```sh
cd docker
docker-compose up
```

### .Dockerfile

These files are very simple Dockerfile. Each Dockerfile inherits directly from nodejs docker image, adding the needed environment variables, exposing the right HTTP port and start the process.

Thankfully to `fastify-cli`, `npm run microservice` is a script described in `package.json` file that allows you to start a **single** plugin as a server. Passing the right parameters, each Dockerfile starts the right plugin with the right prefix.

### Nginx

The nginx configuration describes how the external incoming request should be proxied to the right service.

*NB:* to describe the upstream, nginx needs to know where the microservices are. To do this, nginx uses hostnames that are automatically resolved by docker compose. The standard ports are used in order to reduce the complexity.

### Databases

MongoDB and Redis start using the official docker images

## TODO

- [x] Search users
- [x] Timeline
- [x] Follow microservices for following and unfollowing other users
- [ ] Better test
- [ ] Better README.md
- [x] Use Docker compose
- [ ] Use `fastify-react` for react serve side rendering
- [x] Better UI
- [ ] Even better UI
