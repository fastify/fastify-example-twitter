FROM node:8.5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 80

ENV USER_MONGO_URL mongodb://mongo/user
ENV JWT_SECRET qwertyuiopqwertyuiop

CMD [ "npm", "run", "microservice", "--", "--port", "80", "--log-level", "debug", "--prefix", "/api/user", "user/index.js" ]
