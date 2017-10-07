FROM node:8.5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 80

ENV USER_MICROSERVICE_BASE_URL http://user
ENV FOLLOW_MICROSERVICE_BASE_URL http://follow
ENV TWEET_MICROSERVICE_BASE_URL http://tweet

CMD [ "npm", "run", "microservice", "--", "--port", "80", "--log-level", "debug", "--prefix", "/api/timeline", "timeline/index.js" ]
