
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILED,

  LOGOUT_SUCCESS,

  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILED,

  TWEETS_REQUEST,
  TWEETS_SUCCESS,
  TWEETS_FAILD,

  POST_TWEET_REQUEST,
  POST_TWEET_SUCCESS,
  POST_TWEET_FAILED,

  SEARCH_SUCCESS,
  SEARCH_FAILED
 } from './actionTypes'
import axios from 'axios'

import { push } from 'react-router-redux'

const doingLogin = () => ({ type: LOGIN_REQUEST })
const loginSuccess = ({jwt}) => ({ type: LOGIN_SUCCESS, jwt })
const loginFailed = error => ({ type: LOGIN_FAILED, error: error.response.data.message })

export const makeLogin = (username, password) => dispatch => {
  dispatch(doingLogin())
  return axios.post('/api/login', { username, password })
    .then((response) => response.data)
    .then(body => {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + body.jwt
      dispatch(loginSuccess(body))
    })
    .catch(error => dispatch(loginFailed(error)))
}

const doingRegister = () => ({ type: REGISTER_REQUEST })
const registerSuccess = ({jwt}) => ({ type: REGISTER_SUCCESS, jwt })
const registerFailed = error => ({ type: REGISTER_FAILED, error: error.response.data.message })

export const makeRegister = ({email, username, password}) => dispatch => {
  dispatch(doingRegister())
  return axios.post('/api/register', { email, username, password })
    .then((response) => response.data)
    .then(body => {
      dispatch(push('/login'))
      return dispatch(registerSuccess(body))
    })
    .catch(error => dispatch(registerFailed(error)))
}

const requestingTweets = () => ({ type: TWEETS_REQUEST })
const tweetsSuccess = tweets => ({ type: TWEETS_SUCCESS, tweets })
const tweetsFailed = error => ({ type: TWEETS_FAILD, error })
export const askTweets = () => dispatch => {
  dispatch(requestingTweets())

  // return Promise.resolve({data: tweets})
  return axios.get('/api/tweet')
    .then((response) => response.data)
    .then(body => dispatch(tweetsSuccess(body)))
    .catch(error => dispatch(tweetsFailed(error)))
}

const postingTweet = () => ({ type: POST_TWEET_REQUEST })
const postTweetSuccess = () => ({ type: POST_TWEET_SUCCESS })
const postTweetFailed = () => ({ type: POST_TWEET_FAILED })
export const postNewTweet = (text) => dispatch => {
  dispatch(postingTweet())
  return axios.post('/api/tweet', { text })
    .then((response) => response.data)
    .then(body => {
      dispatch(postTweetSuccess(body))
      askTweets()(dispatch)
    })
    .catch(error => dispatch(postTweetFailed(error)))
}

const logoutSuccess = () => ({ type: LOGOUT_SUCCESS })
export const logout = () => dispatch => {
  delete axios.defaults.headers.common['Authorization']
  dispatch(logoutSuccess())
}

const searchSuccess = users => ({ type: SEARCH_SUCCESS, users })
const searchFail = () => ({ type: SEARCH_FAILED })
export const search = searchText => dispatch => {
  return axios.get('/api/search', { params: { search: searchText } })
    .then((response) => response.data)
    .then(body => dispatch(searchSuccess(body)))
    .catch(error => dispatch(searchFail(error)))
}
