/*
  This modal controlls the selling of tokens.
  It was adapted from token-modal.js and contains references to 'burn' tokens.
*/

// Global npm libraries
import React from 'react'
import PropTypes from 'prop-types'
import { Content, Row, Col, Box, Button, Inputs } from 'adminlte-2-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'

// Local libraries
import './token.css'
const siteConfig = require('../../site-config')

let _this
const { Text } = Inputs

class SellModal extends React.Component {
  constructor (props) {
    super(props)
    _this = this
    this.state = {
      copySuccess: '',
      isBurnView: false,
      txId: '',
      errMsg: '',
      inFetch: false,
      sellQty: 1,
      pricePerToken: 0.02
    }

    this.modalFooter = (
      <>
        <Button text='Close' pullLeft onClick={this.handleModal} />
        <Button
          type='primary'
          text='Sell'
          pullRight
          onClick={this.handleConfirm}
        />
      </>
    )

    this.confirmFooter = (
      <>
        <Button text='No' pullLeft onClick={() => this.sellTokens(false)} />
        <Button
          type='primary'
          text='Yes'
          pullRight
          onClick={() => this.sellTokens(true)}
        />
      </>
    )

    this.onDoneFooter = (
      <>
        <Button
          text='Close'
          pullLeft
          onClick={() => this.sellTokens(false)}
        />
      </>
    )
  }

  render () {
    const token = _this.props.token

    return (
      <>

        <Content
          title={_this.state.isBurnView ? `Sell ${token.name}` : token.name}
          modal
          modalFooter={
            !_this.state.isBurnView
              ? this.modalFooter
              : _this.state.txId || _this.state.errMsg
                ? this.onDoneFooter
                : this.confirmFooter
          }
          show={_this.props.show}
          modalCloseButton
          onHide={_this.handleModal}
        >
          <Row>
            <Col sm={12}>
              {_this.state.isBurnView && !_this.state.txId && (
                <Box loaded={!_this.state.inFetch} className='border-none'>
                  <p>
                    Are you sure you want to sell {`${this.state.sellQty} `}
                    tokens at {`$${this.state.pricePerToken} `} per token?
                  </p>
                </Box>
              )}

              {_this.state.isBurnView && _this.state.txId && (
                <div className='text-center '>
                  <p>Order Submitted</p>
                  <p>P2WDB entry CID:</p>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href={`https://p2wdb.fullstack.cash/entry/hash/${_this.state.txId}`}
                  >
                    {_this.state.txId}
                  </a>
                </div>
              )}

              {_this.state.isBurnView && _this.state.errMsg && (
                <div className='text-center'>
                  <p className='error-color'> {_this.state.errMsg}</p>
                </div>
              )}

              {!_this.state.isBurnView && (
                <Box className=' border-none '>
                  <Row>
                    <Col
                      sm={12}
                      className='text-center   tokenModal-info-container'
                    >

                      <Row className='tokenModal-info-content mt-1 text-left'>
                        <Col xs={12}>
                          <Row>
                            <Col xs={12} sm={3}>
                              <b>TokenId:</b>
                            </Col>
                            <Col xs={9} sm={7}>
                              {token.tokenId}
                            </Col>
                            <Col
                              xs={3}
                              sm={2}
                              className={
                                _this.state.copySuccess ? 'nopadding' : ''
                              }
                            >
                              {_this.state.copySuccess === 'tokenId'
                                ? (
                                  <div className='copied-text'>
                                    <span>Copied!</span>
                                  </div>
                                  )
                                : (
                                  <FontAwesomeIcon
                                    className='icon btn-animation'
                                    style={{ cssFloat: 'right' }}
                                    size='lg'
                                    onClick={() =>
                                      _this.copyToClipBoard('tokenId')}
                                    icon='copy'
                                  />
                                  )}
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row className='tokenModal-info-content mt-1 text-left'>
                        <Col xs={12}>
                          <Row>
                            <Col xs={12} sm={3}>
                              <b>Ticker:</b>
                            </Col>
                            <Col xs={12} sm={9}>
                              {token.ticker}
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row className='tokenModal-info-content mt-1 text-left'>
                        <Col xs={12}>
                          <Row>
                            <Col xs={12} sm={3}>
                              <b>Balance:</b>
                            </Col>
                            <Col xs={12} sm={9}>
                              {token.qty}
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row className='tokenModal-info-content mt-1 text-left'>
                        <Col xs={12}>
                          <Row>
                            <Col xs={12} sm={3}>
                              <b>Sell Qty:</b>
                            </Col>
                            <Col xs={12} sm={9}>
                              <Text
                                id='sellQty'
                                name='sellQty'
                                placeholder='1'
                                label=''
                                labelPosition='below'
                                onChange={_this.handleSellQty}
                                className='title-icon'
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row className='tokenModal-info-content mt-1 text-left'>
                        <Col xs={12}>
                          <Row>
                            <Col xs={12} sm={3}>
                              <b>Price Per<br />Token (USD):</b>
                            </Col>
                            <Col xs={12} sm={9}>
                              <Text
                                id='pricePerToken'
                                name='pricePerTOken'
                                placeholder='0.02'
                                label=''
                                labelPosition='below'
                                onChange={_this.handlePricePerToken}
                                className='title-icon'
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                    </Col>
                  </Row>
                </Box>
              )}
            </Col>
          </Row>
        </Content>
      </>
    )
  }

  // Update the quantity of tokens to sell
  handleSellQty (event) {
    const value = event.target.value
    // console.log('value: ', value)

    _this.setState({
      sellQty: parseFloat(value)
    })

    // console.log('_this.state.sellQty: ', _this.state.sellQty)
  }

  handlePricePerToken (event) {
    const value = event.target.value
    // console.log('value: ', value)

    _this.setState({
      pricePerToken: parseFloat(value)
    })
  }

  // copy info  to clipboard
  copyToClipBoard (key) {
    const val = _this.props.token[key]
    const textArea = document.createElement('textarea')
    textArea.value = val // copyText.textContent;
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('Copy')
    textArea.remove()

    _this.handleCopySuccess(key)
  }

  handleCopySuccess (key) {
    _this.setState({
      copySuccess: key
    })
    setTimeout(() => {
      _this.setState({
        copySuccess: ''
      })
    }, 1000)
  }

  // This is called when the user clicks the 'Sell' button to place their order.
  handleConfirm () {
    // Verify that inputs are valid.
    if (isNaN(_this.state.sellQty)) {
      alert('Token quantity must be a number.')
      return
    }
    if (isNaN(_this.state.pricePerToken)) {
      alert('Price per token must be a number.')
      return
    }

    _this.setState({
      isBurnView: true
    })
  }

  handleModal () {
    // if txId exist refresh tokens on close
    _this.props.handleOnHide(_this.state.txId)

    setTimeout(() => {
      _this.setState({
        isBurnView: false,
        txId: '',
        errMsg: '',
        inFetch: false
      })
    }, 200)
  }

  async sellTokens (isConfirmed) {
    try {
      // Dismiss
      if (!isConfirmed) {
        _this.handleModal()
        return
      }

      console.log('Putting in order to sell tokens...')

      // Throw up spinny-waiting-gif
      _this.setState({
        inFetch: true
      })

      const { bchWallet, token } = _this.props
      console.log('token: ', token)

      // Error if trying to sell more tokens than the wallet holds.
      if (token.qty < _this.state.sellQty) {
        alert(`Error: The wallet has ${token.qty} tokens, which is less than the ${_this.state.sellQty} tokens you are trying to sell.`)
      }

      console.log(`bch-dex server: ${siteConfig.bchDexUrl}`)

      // Convert the dollar amount of tokens to sats.
      const bchSpotPrice = await bchWallet.getUsd()
      console.log('bchSpotPrice: ', bchSpotPrice)
      const bchPerToken = _this.state.pricePerToken / bchSpotPrice
      console.log('bchPerToken: ', bchPerToken)
      const satsPerToken = Math.floor(bchWallet.bchjs.BitcoinCash.toSatoshi(bchPerToken))
      console.log('satsPerToken: ', satsPerToken)

      const orderObj = {
        order: {
          lokadId: 'SWP',
          messageType: 1,
          messageClass: 1,
          tokenId: token.tokenId,
          buyOrSell: 'sell',
          numTokens: _this.state.sellQty,
          rateInBaseUnit: satsPerToken,
          minUnitsToExchange: satsPerToken * _this.state.sellQty
        }
      }

      const result = await axios.post(`${siteConfig.bchDexUrl}/order`, orderObj)
      console.log('result.data: ', result.data)

      // console.log('starting sleep')
      // await bchWallet.bchjs.Util.sleep(5000)
      // console.log('ended sleep')

      // Remove spinny-waiting-gif and display the TXID of the transaction.
      _this.setState({
        txId: result.data.hash,
        inFetch: false
      })
    } catch (error) {
      console.warn(error)
      _this.setState({
        errMsg: error.message,
        inFetch: false
      })
    }
  }

  // Deprecated. This handled the burn API call.
  async handleBurnAll (isConfirmed) {
    try {
      // Dismiss
      if (!isConfirmed) {
        _this.handleModal()
        return
      }

      /**
       *  BURN ALL
       *
       */
      _this.setState({
        inFetch: true
      })
      const { bchWallet, token } = _this.props

      const result = await bchWallet.burnAll(token.tokenId)
      console.log('burn txid: ', result)
      _this.setState({
        txId: result,
        inFetch: false
      })
    } catch (error) {
      console.warn(error)
      _this.setState({
        errMsg: error.message,
        inFetch: false
      })
    }
  }
}

SellModal.propTypes = {
  token: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  handleOnHide: PropTypes.func.isRequired,
  bchWallet: PropTypes.object, // get minimal-slp-wallet instance
  explorerURL: PropTypes.string
}

export default SellModal
