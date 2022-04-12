import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Box, Button } from 'adminlte-2-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import JSONPretty from "react-json-pretty"

let _this
class Details extends React.Component {
  constructor (props) {
    super(props)

    _this = this

    this.state = {
      order: {}
    }
  }

  render () {
    const { order } = _this.state
    return (
      <>
        <Row>
          <Col sm={12}>
            <Box className=' border-none mt-2' loaded={!this.state.inFetch}>
              <Row className='text-center'>
                <Col sm={12}>
                  <h1 id='SendTokens'>
                    <FontAwesomeIcon
                      className='title-icon'
                      size='xs'
                      icon='info-circle'
                    />
                    <span>Details</span>
                  </h1>
                  {order._id && (
                    <Box className='border-none details-data-content'>
                      <p>
                        <b>Message Type: </b>
                        {order.messageType}
                      </p>
                      <p>
                        <b>Message Class: </b>
                        {order.messageClass}
                      </p>
                      <p>
                        <b>Create At: </b>
                        {new Date(order.localTimestamp).toLocaleString()}
                      </p>
                      <p>
                        <b>ID: </b>
                        {order._id}
                      </p>
                      <p>
                        <b>Token Id: </b>
                        {order.tokenId}

                      </p>
                      <p>
                        <b>Order Type : </b>
                        {order.buyOrSell}

                      </p>
                      <p>
                        <b>Rate in Stats : </b>
                        {order.rateInSats}

                      </p>
                      <p>
                        <b>Min. Sats to Exchange : </b>
                        {order.minSatsToExchange}

                      </p>
                      <p>
                        <b>Num Tokens: </b>
                        {order.numTokens}

                      </p>
                      <p>
                        <b>Utxo TxId: </b>
                        {order.utxoTxid}

                      </p>
                      <p>
                        <b>Utxo Vout: </b>
                        {order.utxoVout}

                      </p>
                      <p>
                        <b>Tx Hex : </b>
                        {order.txHex}

                      </p>

                      <p>
                        <b>Timestamp : </b>
                        {order.timestamp}

                      </p>
                      <p>
                        <b>LocalTimestamp : </b>
                        {order.localTimestamp}

                      </p>
                      <p>
                        <b>p2wdbHash : </b>
                        {order.p2wdbHash}

                      </p>
                      <p>
                        <b>Offer Hash : </b>
                        {order.offerHash}

                      </p>
                      <p>
                        <b>Address References : </b>
                        {order.addrReferences}

                      </p>
                    </Box>
                  )}
                </Col>
                <Col sm={12}>
                  <div className='btn-wrapper'>
                    <Button
                      text='Take'
                      type='primary'
                      className='btn-lg on-click-event  mr-1 ml-1 mt-1 take-btn-lg'
                      onClick={() => _this.props.onTake({ data: order })}
                    />
                    <Button
                      text='Close'
                      type='primary'
                      className='btn-lg btn-close-entry mr-1 ml-1 mt-1'
                      onClick={_this.handleClose}
                    />
                  </div>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>
      </>
    )
  }

  componentDidMount () {
    _this.handleData()
  }

  componentDidUpdate () {
    if (_this.props.order._id !== _this.state.order._id) {
      _this.handleData()
    }
  }

  handleData () {
    try {
      const { order } = _this.props
      console.log('order', order)
      _this.setState({
        order: order.data
      })
    } catch (err) {
      console.warn('Error in handleData()', err)
    }
  }

  handleClose () {
    _this.props.onClose()
  }

  // Detects if the input is a string and converts to json object
  isJson (data) {
    try {
      JSON.parse(data)
      return true
    } catch (error) {
      return false
    }
  }
}
Details.propTypes = {
  order: PropTypes.object,
  onClose: PropTypes.func,
  onTake: PropTypes.func
}
export default Details
