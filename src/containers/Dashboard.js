import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'

import Twitters from './Twitters'

const Dasboard = ({isLogged}) => {
  if (!isLogged) return <Redirect to='/login' />
  return <Twitters />
}

Dasboard.propTypes = {
  isLogged: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => {
  return {
    isLogged: !!state.user.jwt
  }
}

export default connect(mapStateToProps)(Dasboard)
