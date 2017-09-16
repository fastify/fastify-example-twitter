import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { logout } from '../action'

const LoggedAppHeader = ({logout}) => <div>Logged AppHeader<button onClick={() => logout()}>Logout</button></div>
const LoginAppHeader = () => <div>Login AppHeader</div>

const AppHeader = ({headerClass}) => headerClass

AppHeader.propTypes = {
  headerClass: PropTypes.element.isRequired
}

const mapStateToProps = (state) => {
  return {
    isLoginPage: state.router.location.pathname === '/login'
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    logout: () => dispatch(logout())
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  let headerClass = <LoggedAppHeader logout={() => dispatchProps.logout()} />
  if (stateProps.isLoginPage) {
    headerClass = <LoginAppHeader />
  }
  return { headerClass }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AppHeader)
