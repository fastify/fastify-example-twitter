import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { getUserTweets, getUser, getFollowers, getFollowings } from '../action'

import TweetList from '../components/TweetList'

import Panel from 'muicss/lib/react/panel'

const UserProfile = ({profile, followersCount, followingsCount}) => <Panel>
  <p>username: <b>{profile.username}</b></p>
  <p>followers <b>{followersCount}</b></p>
  <p>followings <b>{followingsCount}</b></p>
</Panel>

class UserPage extends React.Component {
  componentDidMount () {
    this.props.getUserTweets(this.props.userId)
    this.props.getUser(this.props.userId)
    this.props.getFollowers(this.props.userId)
    this.props.getFollowings(this.props.userId)
  }

  render () {
    if (!this.props.isLogged) return <Redirect to='/login' />

    const userProfile = this.props.profile
      ? <UserProfile profile={this.props.profile}
        followersCount={this.props.followersCount}
        followingsCount={this.props.followingsCount} />
      : <Panel>loading...</Panel>
    return <div>
      <div style={{width: '60%', marginLeft: '20%'}}>
        { userProfile }
      </div>
      <TweetList tweets={this.props.tweets} />
    </div>
  }
}

UserPage.propTypes = {}

const mapStateToProps = (state, props) => {
  const userId = props.match.params.userId
  return {
    isLogged: !!state.user.jwt,
    tweets: state.userTweet[userId] || [],
    userId: userId,
    profile: state.users[userId],
    followersCount: (state.follower[userId] || []).length,
    followingsCount: (state.following[userId] || []).length
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getUserTweets: userId => dispatch(getUserTweets(userId)),
    getUser: userId => dispatch(getUser(userId)),
    getFollowers: userId => dispatch(getFollowers(userId)),
    getFollowings: userId => dispatch(getFollowings(userId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserPage)
