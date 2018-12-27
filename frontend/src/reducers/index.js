/* global localStorage */
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

  SEARCH_SUCCESS,
  SEARCH_FAILED,

  MY_FOLLOWING_SUCCESS,

  USER_TWEET_SUCCESS,

  USER_SUCCESS,

  FOLLOWER_SUCCESS,
  FOLLOWING_SUCCESS
 } from '../action/actionTypes'

import axios from 'axios'

const USER_INITIAL_STATE = { jwt: localStorage.getItem('jwt') }
const getJwt = () => localStorage.getItem('jwt')
if (getJwt()) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + getJwt()
}

function user (state = USER_INITIAL_STATE, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, isFetching: true }
    case LOGIN_SUCCESS:
      localStorage.setItem('jwt', action.jwt)
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + getJwt()
      return { ...state, isFetching: false, jwt: action.jwt }
    case LOGIN_FAILED:
      localStorage.removeItem('jwt')
      delete axios.defaults.headers.common['Authorization']
      return { ...state, isFetching: false, error: action.error }
    case REGISTER_REQUEST:
      return { ...state, isFetching: true }
    case REGISTER_SUCCESS:
      return { ...state, isFetching: false, jwt: action.jwt }
    case REGISTER_FAILED:
      return { ...state, isFetching: false, error: action.error }
    case LOGOUT_SUCCESS:
      localStorage.removeItem('jwt')
      delete axios.defaults.headers.common['Authorization']
      return { ...state, isFetching: false, error: null, jwt: null }
    default:
      return state
  }
}

const TWEETS_INITIAL_STATE = { isFetching: false, tweets: [], error: null }
function tweets (state = TWEETS_INITIAL_STATE, action) {
  switch (action.type) {
    case TWEETS_REQUEST:
      return { ...state, isFetching: true }
    case TWEETS_SUCCESS:
      return { ...state, isFetching: false, tweets: action.tweets }
    case TWEETS_FAILD:
      return { ...state, isFetching: false, error: action.error }
    default:
      return state
  }
}

const SEARCH_INITIAL_STATE = { users: [] }
function search (state = SEARCH_INITIAL_STATE, action) {
  switch (action.type) {
    case SEARCH_SUCCESS:
      return { ...state, users: action.users }
    case SEARCH_FAILED:
      return { ...state, users: [] }
    default:
      return state
  }
}

const MY_FOLLOWING_INITIAL_STATE = { users: [] }
function myFollowing (state = MY_FOLLOWING_INITIAL_STATE, action) {
  switch (action.type) {
    case MY_FOLLOWING_SUCCESS:
      return { ...state, users: action.users }
    default:
      return state
  }
}

const USER_TWEET_INITIAL_STATE = { }
function userTweet (state = USER_TWEET_INITIAL_STATE, action) {
  switch (action.type) {
    case USER_TWEET_SUCCESS:
      return { ...state, [action.userId]: action.tweets }
    default:
      return state
  }
}

const USERS_INIT_STATE = {}
function users (state = USERS_INIT_STATE, action) {
  switch (action.type) {
    case USER_SUCCESS:
      return { ...state, [action._id]: { username: action.username } }
    default:
      return state
  }
}

const FOLLOWER_INIT_STATE = {}
function follower (state = FOLLOWER_INIT_STATE, action) {
  switch (action.type) {
    case FOLLOWER_SUCCESS:
      return { ...state, [action.userId]: action.followers }
    default:
      return state
  }
}

const FOLLOWING_INIT_STATE = {}
function following (state = FOLLOWING_INIT_STATE, action) {
  switch (action.type) {
    case FOLLOWING_SUCCESS:
      return { ...state, [action.userId]: action.following }
    default:
      return state
  }
}

export default {
  user,
  tweets,
  search,
  myFollowing,
  userTweet,
  users,
  follower,
  following
}
