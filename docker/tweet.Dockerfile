FROM node:8.5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 3006

ENV TWEET_MONGO_URL mongodb://mongo/tweet
ENV USER_MICROSERVICE_BASE_URL http://user:3005

CMD [ "npm", "run", "microservice", "--", "--port", "3006", "tweet/index.js" ]
