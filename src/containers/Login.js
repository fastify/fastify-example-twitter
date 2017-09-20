import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'

import { makeLogin, makeRegister } from '../action'

import Form from 'muicss/lib/react/form'
import Input from 'muicss/lib/react/input'
import Button from 'muicss/lib/react/button'
import Container from 'muicss/lib/react/container'
import Row from 'muicss/lib/react/row'
import Col from 'muicss/lib/react/col'

class LoginForm extends React.Component {
  constructor () {
    super()

    this.usernameInput = null
    this.passwordInput = null
  }

  render () {
    const {isLogged, isFetching} = this.props

    if (isLogged) return <Redirect to='/' />

    if (isFetching) {
      return <div>Loading!!!</div>
    }

    const login = () => {
      const username = this.usernameInput.controlEl.value
      const password = this.passwordInput.controlEl.value
      this.props.onLogin(username, password)
      return false
    }

    const errorDiv = this.props.error
      ? <div className='mui--text-caption mui--text-danger'>{this.props.error}</div>
      : <div className='mui--text-caption' />

    const divStyle = {
      height: '350',
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
                <legend>Login</legend>
                <Input hint='username' type='text' ref={input => { this.usernameInput = input }} />
                <Input hint='password' type='password' ref={input => { this.passwordInput = input }} />
                {errorDiv}
                <div className='mui--text-center'>
                  <Button size='large' color='primary' onClick={() => login()}>Login</Button>
                  <div>or</div>
                  <Button size='small' variant='flat' color='primary' onClick={() => this.props.history.push('/signup')}>Signup</Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

LoginForm.propTypes = {
  isLogged: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
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
    onLogin: (username, password) => dispatch(makeLogin(username, password)),
    onRegister: (username, password) => dispatch(makeRegister(username, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
