import React from 'react'

import Container from 'muicss/lib/react/container'
import Row from 'muicss/lib/react/row'
import Col from 'muicss/lib/react/col'
import Panel from 'muicss/lib/react/panel'

const Tweet = ({_id, text, user}) => {
  return <Panel>
    <p>{text}</p>
    <small className='mui--pull-right'>{user.username}</small>
  </Panel>
}

const TweetList = props => {
  console.log(props)
  return <Container fluid>
    <Row>
      <Col md='4' md-offset='4'>
        { props.tweets.map(t => <Tweet key={t._id} {...t} />) }
      </Col>
    </Row>
  </Container>
}

export default TweetList
