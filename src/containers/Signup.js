import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'

import { makeRegister } from '../action'

import Form from 'muicss/lib/react/form'
import Input from 'muicss/lib/react/input'
import Button from 'muicss/lib/react/button'
import Container from 'muicss/lib/react/container'
import Row from 'muicss/lib/react/row'
import Col from 'muicss/lib/react/col'

class Signup extends React.Component {
  constructor () {
    super()

    this.emailInput = null
    this.usernameInput = null
    this.passwordInput = null
  }

  render () {
    const {isLogged, isFetching} = this.props

    if (isLogged) return <Redirect to='/' />

    if (isFetching) {
      return <div>Loading!!!</div>
    }

    const signup = () => {
      const email = this.emailInput.controlEl.value
      const username = this.usernameInput.controlEl.value
      const password = this.passwordInput.controlEl.value
      this.props.onSignup({ email, username, password })
      return false
    }

    const errorDiv = this.props.error
      ? <div className='mui--text-caption mui--text-danger'>{this.props.error}</div>
      : <div className='mui--text-caption' />

    const divStyle = {
      height: '450',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      margin: 'auto'
    }

    return (
      <div style={divStyle}>
        <Container fluid>
          <Row>
            <Col md='4' md-offset='4'>
              <Form>
                <legend>Sign up</legend>
                <Input hint='email' type='email' ref={input => { this.emailInput = input }} />
                <Input hint='username' type='text' ref={input => { this.usernameInput = input }} />
                <Input hint='password' type='password' ref={input => { this.passwordInput = input }} />
                {errorDiv}
                <div className='mui--text-center'>
                  <Button size='large' color='primary' onClick={() => signup()}>Sign up</Button>
                  <div>or</div>
                  <Button size='small' variant='flat' color='primary' onClick={() => this.props.history.push('/login')}>Login</Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

Signup.propTypes = {
  isLogged: PropTypes.bool.isRequired,
  onSignup: PropTypes.func.isRequired,
  error: PropTypes.string
}

const mapStateToProps = (state) => {
  return {
    isLogged: !!state.user.jwt,
    isFetching: state.user.isFetching,
    error: state.user.error
  }
}

const mapDispatchToProps = (dispatch, a, b, c) => {
  return {
    onSignup: ({email, username, password}) => {
      return dispatch(makeRegister({ email, username, password }))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)
