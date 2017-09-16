
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
  TWEETS_FAILD
 } from '../action/actionTypes'

function user (state = {}, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, isFetching: true }
    case LOGIN_SUCCESS:
      return { ...state, isFetching: false, jwt: action.jwt }
    case LOGIN_FAILED:
      return { ...state, isFetching: false, error: action.error }
    case REGISTER_REQUEST:
      return { ...state, isFetching: true }
    case REGISTER_SUCCESS:
      return { ...state, isFetching: false, jwt: action.jwt }
    case REGISTER_FAILED:
      return { ...state, isFetching: false, error: action.error }
    case LOGOUT_SUCCESS:
      return { ...state, isFetching: false, error: null, jwt: null }
  }
  return state
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
  }
  return state
}

export default {
  user: user,
  tweets: tweets
}
