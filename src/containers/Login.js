import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'

import { makeLogin, makeRegister } from '../action'

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
      const username = this.usernameInput.value
      const password = this.passwordInput.value
      this.props.onLogin(username, password)
      return false
    }

    const register = () => {
      const username = this.usernameInput.value
      const password = this.passwordInput.value
      this.props.onRegister(username, password)
      return false
    }

    const errorDiv = this.props.error ? <div>{this.props.error}</div> : null

    return (
      <div>
        <input type='text' ref={input => { this.usernameInput = input }} />
        <input type='password' ref={input => { this.passwordInput = input }} />
        <button onClick={() => login()}>Login</button>
        <button onClick={() => register()}>Register</button>
        {errorDiv}
      </div>
    )
  }
}

LoginForm.propTypes = {
  isLogged: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
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
