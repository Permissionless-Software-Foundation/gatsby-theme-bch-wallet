import React from 'react'
import PropTypes from 'prop-types'
import { Content, Row, Col, Box, Button } from 'adminlte-2-react'
import TokenCard from './token-card'
import TokenModal from './token-modal'
import Spinner from '../../../images/loader.gif'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SendTokens from './send-tokens'
// import { SlpMutableData } from 'slp-mutable-data'
import axios from 'axios'

const isIpfs = require('is-ipfs')

let _this

class Tokens extends React.Component {
  constructor (props) {
    super(props)
    _this = this
    this.state = {
      tokens: [],
      selectedTokenToView: '',
      showModal: false,
      inFetch: true,
      errMsg: '',
      selectedTokenToSend: '',
      showForm: false,
      txId: null,
      explorerURL: ''
    }
  }

  render () {
    // const { JWT } = _this.props.walletInfo

    return (
      <>
        <Button
          text='Refresh'
          icon='fa-redo'
          type='primary'
          className='btn-md ml-1 mt-1 mb-1'
          onClick={() => _this.handleGetTokens(true)}
        />
        {_this.state.txId && (
          <div className='txIdContainer'>
            <button onClick={() => _this.setState({ txId: null })}>
              &times;
            </button>
            <Col xs={12} className='text-center mt-1'>
              <Box title='Transaction ID' type='primary' className='p-0'>
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={`${_this.state.explorerURL}${_this.state.txId}`}
                >
                  {_this.state.txId}
                </a>
              </Box>
            </Col>
          </div>
        )}
        {_this.state.showForm && (
          <SendTokens
            bchWallet={_this.props.bchWallet}
            walletInfo={_this.props.walletInfo}
            handleBack={_this.onHandleForm}
            selectedToken={
              _this.state.selectedTokenToSend
                ? _this.state.selectedTokenToSend
                : {}
            }
            handleSend={() => _this.onHandleGetTokens(true)}
            setTxId={_this.setTxId}
          />
        )}
        {_this.state.inFetch
          ? (
            <div className='spinner'>
              <img alt='Loading...' src={Spinner} width={100} />
            </div>
            )
          : (
            <Content>
              {_this.state.errMsg && (
                <Box padding='true' className='container-nofound'>
                  <Row>
                    <Col xs={12}>
                      <em>{_this.state.errMsg}</em>
                    </Col>
                  </Row>
                </Box>
              )}

              {_this.state.tokens.length > 0 && (
                <>
                  <Row>
                    {_this.state.tokens.map((val, i) => {
                      if (val.qty > 0) {
                        return (
                          <Col sm={4} key={`token-${i}`}>
                            <TokenCard
                              key={`token-${i}`}
                              id={`token-${i}`}
                              token={val}
                              showToken={_this.showToken}
                              selectToken={_this.selectToken}
                            />
                          </Col>
                        )
                      } else {
                        return <span key={`token-${i}`} />
                      }
                    })}
                  </Row>
                </>
              )}
            </Content>
            )}

        <TokenModal
          bchWallet={_this.props.bchWallet}
          token={
            _this.state.selectedTokenToView
              ? _this.state.selectedTokenToView
              : {}
          }
          handleOnHide={_this.onHandleToggleModal}
          show={_this.state.showModal}
          explorerURL={_this.state.explorerURL}
        />
      </>
    )
  }

  setTxId (txId = null) {
    console.log(`Setting txid to ${txId}`)
    _this.setState({
      txId: txId
    })
  }

  onHandleForm () {
    _this.setState({
      showForm: !_this.state.showForm
    })
  }

  async handleGetTokens (refresh = null) {
    _this.setState({
      inFetch: true
    })
    const { mnemonic } = _this.props.walletInfo
    const bchWallet = _this.props.bchWallet
    let tokens = []

    try {
      if (!mnemonic || !bchWallet) {
        throw new Error(
          'You need to create or import a wallet first, to view tokens'
        )
      }

      await bchWallet.walletInfoPromise

      if (_this.props.tokensInfo.length > 0 && refresh === null) {
        tokens = _this.props.tokensInfo
      } else {
        tokens = await bchWallet.listTokens()
      }
      const mutableTokens = await _this.handleMutableData(tokens)
      // console.log(`mutableTokens: ${JSON.stringify(mutableTokens, null, 2)}`)

      _this.setState({
        tokens: mutableTokens,
        inFetch: false
      })

      if (!tokens.length) {
        throw new Error('No tokens found on this wallet.')
      }

      _this.props.setTokensInfo(mutableTokens)
    } catch (error) {
      _this.handleError(error)
    }
  }

  // Wrapper for handleGetTokens()
  async onHandleGetTokens (refresh = null) {
    return _this.handleGetTokens(refresh)
  }

  async componentDidMount () {
    _this.defineExplorer()
    await _this.handleGetTokens()
  }

  showToken (selectedTokenToView) {
    _this.setState({
      selectedTokenToView
    })
    _this.onHandleToggleModal()
  }

  selectToken (selectedTokenToSend) {
    _this.setState({
      selectedTokenToSend
    })
    !_this.state.showForm && _this.onHandleForm()

    const ele = document.getElementById('___gatsby')
    ele.scrollIntoView({ behavior: 'smooth' })
  }

  onHandleToggleModal (refresh = null) {
    _this.setState({
      showModal: !_this.state.showModal
    })
    if (refresh) {
      _this.handleGetTokens(true)
    }
  }

  handleError (error) {
    let errMsg = ''
    if (error.message) {
      errMsg = error.message
    }
    if (error.error) {
      if (error.error.match('rate limits')) {
        errMsg = (
          <span>
            Rate limits exceeded, increase rate limits with a JWT token from
            <a
              style={{ marginLeft: '5px' }}
              target='_blank'
              href='https://fullstack.cash'
              rel='noopener noreferrer'
            >
              FullStack.cash
            </a>
          </span>
        )
      } else {
        errMsg = error.error
      }
    }
    _this.setState(prevState => {
      return {
        ...prevState,
        errMsg: errMsg,
        txId: null,
        inFetch: false
      }
    })
  }

  // Define the explorer to use
  // depending on the selected chain
  defineExplorer () {
    const bchWalletLib = _this.props.bchWallet
    const bchjs = bchWalletLib.bchjs

    let explorerURL

    if (bchjs.restURL.includes('abc.fullstack')) {
      explorerURL = 'https://explorer.be.cash/tx/'
    } else {
      explorerURL = 'https://token.fullstack.cash/transactions/?txid='
    }
    _this.setState({
      explorerURL
    })
  }

  // try to get mutable data from token id
  async handleMutableData (tokensArr) {
    try {
      const bchWalletLib = _this.props.bchWallet
      // const bchjs = bchWalletLib.bchjs

      const tokens = []
      // const slpMutableLib = new SlpMutableData()

      for (let i = 0; i < tokensArr.length; i++) {
        const token = tokensArr[i]

        try {
          // OLD code. This can be deleted.
          // // Get token data from bch-api.
          // const tokenData = await bchjs.PsfSlpIndexer.getTokenData(token.tokenId)
          // // console.log(`tokenData ${i}: ${JSON.stringify(tokenData, null, 2)}`)

          await bchWalletLib.walletInfoPromise

          // Get token data from bch-api.
          const tokenData = await bchWalletLib.getTokenData(token.tokenId)
          // console.log(`tokenData ${i}: ${JSON.stringify(tokenData, null, 2)}`)

          // Extract the raw CID.
          const immutableCid = tokenData.immutableData.slice(7)
          const mutableCid = tokenData.mutableData.slice(7)
          // console.log(`immutableCid: ${immutableCid}`)
          // console.log(`mutableCid: ${mutableCid}`)

          // Get mutable data from Filecoin.
          if (isIpfs.cid(mutableCid)) {
            const mutableData = await axios.get(`https://${mutableCid}.ipfs.dweb.link/data.json`)
            token.mutableData = mutableData.data
            // console.log('token.mutableData: ', token.mutableData)
          }

          if (isIpfs.cid(immutableCid)) {
            // Get immutable data from Filecoin.
            const immutableData = await axios.get(`https://${immutableCid}.ipfs.dweb.link/data.json`)
            token.immutableData = immutableData.data
            // console.log('token.immutableData: ', token.immutableData)
          }
        } catch (error) {
          console.warn(error)
          // Skip error
          console.log(
            `Could not access mutable data for ${token.ticker} (${token.tokenId})`
          )
        }

        tokens.push(token)
      }

      return tokens
    } catch (error) {
      console.log('Error in handleMutableData()')
      console.warn(error)
    }
  }
}

Tokens.propTypes = {
  walletInfo: PropTypes.object.isRequired, // wallet info
  bchWallet: PropTypes.object, // get minimal-slp-wallet instance
  setTokensInfo: PropTypes.func.isRequired, // set tokens info
  tokensInfo: PropTypes.array // tokens info
}

export default Tokens
