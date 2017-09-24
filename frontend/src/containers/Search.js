import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom'

import { search, follow, unfollow } from '../action'

import Form from 'muicss/lib/react/form'
import Input from 'muicss/lib/react/input'
import Button from 'muicss/lib/react/button'
import Container from 'muicss/lib/react/container'
import Row from 'muicss/lib/react/row'
import Col from 'muicss/lib/react/col'
import Panel from 'muicss/lib/react/panel'

class SearchForm extends React.Component {
  constructor () {
    super()

    this.searchInput = null
  }

  handleSubmit (ev) {
    ev.preventDefault()

    const searchText = this.searchInput.controlEl.value
    this.props.onSearch(searchText)

    return false
  }

  render () {
    return <Form onSubmit={ev => this.handleSubmit(ev)}>
      <legend>Search</legend>
      <Input hint='search' type='text' ref={input => { this.searchInput = input }} disabled={this.props.disabled} />
      <Button className='mui--pull-right' type='submit' disabled={this.props.disabled}>Search</Button>
    </Form>
  }
}

const UserRow = ({_id, username, label, onClick, goToUserPage}) => {
  const onFollowButtonClicked = e => {
    e.preventDefault()
    onClick(_id)
    return false
  }
  return <Link to={'/user/' + _id}>
    <Panel>
      <span>{username}</span>
      <Button className='mui--pull-right' color='primary' onClick={onFollowButtonClicked}>{label}</Button>
    </Panel>
  </Link>
}

const UserList = ({users, followings, onUnfollow, onFollow}) => {
  return <div>{
    users.map(user => {
      const isFollowing = followings.includes(user._id)
      const buttonLabel = isFollowing ? 'unfollow' : 'follow'
      const onClick = isFollowing ? onUnfollow : onFollow
      return <UserRow {...user}
        key={user._id}
        label={buttonLabel}
        onClick={onClick} />
    })
  }</div>
}

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
}

class Search extends React.Component {
  constructor () {
    super()
    this.state = { searching: false }
  }

  onSearch (searchText) {
    this.setState({
      searching: true
    }, () => {
      this.props.onSearch(searchText)
    })
  }

  componentWillUpdate (nextProps, nextState) {
    if (this.state.searching) {
      this.setState({ searching: false })
    }
  }

  render () {
    if (!this.props.isLogged) return <Redirect to='/login' />

    const searchingLoader = this.state.searching
      ? <p>Loading...</p>
      : ''

    return (
      <div>
        <Container fluid>
          <Row>
            <Col md='4' md-offset='4'>
              <SearchForm onSearch={text => this.onSearch(text)} disabled={this.state.searching} />
            </Col>
          </Row>
          { searchingLoader }
          <UserList
            users={this.props.users}
            followings={this.props.followings}
            onUnfollow={this.props.onUnfollow}
            onFollow={this.props.onFollow} />
        </Container>
      </div>
    )
  }
}

Search.propTypes = {
  onSearch: PropTypes.func.isRequired,
  results: PropTypes.array
}

const mapStateToProps = (state) => {
  return {
    users: state.search.users,
    followings: state.myFollowing.users,
    isLogged: !!state.user.jwt
  }
}

const mapDispatchToProps = (dispatch, a, b, c) => {
  return {
    onSearch: searchText => dispatch(search(searchText)),
    onFollow: otherId => dispatch(follow(otherId)),
    onUnfollow: otherId => dispatch(unfollow(otherId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
