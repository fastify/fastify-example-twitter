import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { askTweets, postNewTweet } from '../action'

const Tweet = ({_id, text, user}) => {
  return <li>
    <p>{text}</p>
    <small>{user.username}</small>
  </li>
}

class TweetForm extends React.Component {
  constructor () {
    super()

    this.tweetTextArea = null
  }

  onSubmit () {
    const tweetText = this.tweetTextArea.value
    this.props.onNewTweet(tweetText)
    return false
  }

  render () {
    return <div>
      <textarea ref={(input) => { this.tweetTextArea = input }} />
      <button onClick={() => this.onSubmit()} />
    </div>
  }
}

class Twitters extends React.Component {
  componentWillMount () {
    this.props.askTweets()
  }

  render () {
    const {isFetching, tweets} = this.props
    if (isFetching) return <div>Loading tweets...</div>

    const tweetForm = <TweetForm onNewTweet={text => this.props.onNewTweet(text)} />
    const tweetStream = <ol>
      {
        tweets.map(t => <Tweet key={t._id} {...t} />)
      }
    </ol>
    const noTweetsBanner = tweets.length === 0
      ? <div>No tweet available, let is stating to write one!</div>
      : ''

    return <div>
      {tweetForm}
      {tweetStream}
      {noTweetsBanner}
    </div>
  }
}

Twitters.propTypes = {
  askTweets: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  tweets: PropTypes.array.isRequired,
  error: PropTypes.string,
  onNewTweet: PropTypes.func.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    tweets: state.tweets.tweets,
    isFetching: state.tweets.isFetching
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    askTweets: () => dispatch(askTweets()),
    onNewTweet: text => dispatch(postNewTweet(text))
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    askTweets: () => dispatchProps.askTweets(),
    onNewTweet: text => dispatchProps.onNewTweet(text),
    isFetching: stateProps.isFetching,
    tweets: stateProps.tweets
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Twitters)
