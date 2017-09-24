import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { askTweets, postNewTweet } from '../action'

import Button from 'muicss/lib/react/button'
import Container from 'muicss/lib/react/container'
import Row from 'muicss/lib/react/row'
import Col from 'muicss/lib/react/col'
import Textarea from 'muicss/lib/react/textarea'

import TweetList from '../components/TweetList'

class TweetForm extends React.Component {
  constructor () {
    super()

    this.tweetTextArea = null
  }

  onSubmit () {
    const tweetText = this.tweetTextArea.controlEl.value
    this.props.onNewTweet(tweetText)
    return false
  }

  render () {
    return <div>
      <Container fluid>
        <Row>
          <Col md='4' md-offset='4'>
            <Textarea hint='share me tweet!' ref={(input) => { this.tweetTextArea = input }} />
            <Button className='mui--pull-right' color='primary' onClick={() => this.onSubmit()}>Launch</Button>
          </Col>
        </Row>
      </Container>
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
    const tweetStream = <TweetList tweets={tweets} />
    const noTweetsBanner = tweets.length === 0
      ? <div className='mui--text-center mui--text-dark mui--text-body2'>No tweet available, let is stating to write one!</div>
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
