import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { search } from '../action'

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

const UserList = ({users}) => {
  return <div>{
    users.map(user => <Panel key={user._id}>{user.username}</Panel>)
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
          <UserList users={this.props.users} />
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
    users: state.search.users
  }
}

const mapDispatchToProps = (dispatch, a, b, c) => {
  return {
    onSearch: searchText => dispatch(search(searchText))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
