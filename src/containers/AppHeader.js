import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { logout } from '../action'

import Appbar from 'muicss/lib/react/appbar'
import Button from 'muicss/lib/react/button'
import Container from 'muicss/lib/react/container'
import Row from 'muicss/lib/react/row'
import Col from 'muicss/lib/react/col'

const LoggedAppHeader = ({logout}) => <Appbar>
  <Container fluid style={{paddingTop: '10px'}}>
    <Row>
      <Col md='12'>
        <Button style={{position: 'absolute', right: '15px'}} size='small' color='secondary' onClick={() => logout()}>Logout</Button>
      </Col>
    </Row>
  </Container>
</Appbar>

const LoginAppHeader = () => <Appbar>
  <Container fluid style={{paddingTop: '10px'}}>
    <Row>
      <Col md='12'>
        <div className='mui--text-display1'>Welcome to a clone twitter!</div>
        <small>for learning fastify</small>
      </Col>
    </Row>
  </Container>
</Appbar>

const AppHeader = ({headerClass}) => headerClass

AppHeader.propTypes = {
  headerClass: PropTypes.element.isRequired
}

const mapStateToProps = (state) => {
  return {
    isLoginPage: state.router.location.pathname === '/login' ||
      state.router.location.pathname === '/signup'
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
