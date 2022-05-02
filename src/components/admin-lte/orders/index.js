import React from 'react'
import { Row, Col, Content, Box, DataTable, Button } from 'adminlte-2-react'
import Details from './details'
import './orders.css'
import Spinner from '../../../images/loader.gif'
// const { Text } = Inputs

const axios = require('axios').default
const siteConfig = require('../../site-config')

const SERVER = siteConfig.bchDexUrl

// const EXPLORER_URL = 'https://explorer.bitcoin.com/bch/tx/'

let _this
class Orders extends React.Component {
  constructor (props) {
    super(props)
    _this = this
    this.state = {
      showEntry: false,
      data: [],
      orders: [],
      orderData: null,
      showTakeModal: false,
      takeInput: ''
    }

    this.firstColumns = [
      { title: 'Ticker', data: 'ticker' },
      {
        title: 'Token Id',
        data: 'tokenId',
        render: id => (
          <a href={`https://simpleledger.info/token/${id.tokenId}`} target='_blank' rel='noreferrer'>{id.subString}</a>
        )
      },
      {
        title: 'Type',
        data: 'buyOrSell'
      },
      {
        title: 'Offer hash',
        data: 'offerHash',
        render: hash => (
          <span className='on-click-event action-handler'>{hash.subString}</span>
        )
      },
      { title: 'Qty', data: 'qty' },
      { title: 'Sats Each', data: 'satsEach' },
      { title: 'Sats Total', data: 'satsTotal' },
      { title: 'USD Total', data: 'usdTotal' },
      {
        title: '',
        data: 'take',
        // render: order => (order.data.orderStatus === 'posted'
        //   ? (
        //     <div className='take-btn-table-wrapper'>
        //       <Button
        //         text='Take'
        //         type='primary'
        //         className='btn-lg on-click-event take-btn'
        //         onClick={_this.handleTake}
        //       />
        //     </div>
        //     )
        //   : <p />
        // )
        render: order => (
          <div className='take-btn-table-wrapper'>
            <Button
              text='Take'
              type='primary'
              className='btn-lg on-click-event take-btn'
              onClick={_this.handleTake}
            />
          </div>
        )
      }
    ]
  }

  render () {
    const { data, orderData } = _this.state
    return (
      <>
        <Content
          title='BCH Orders'
          subTitle='BCH Orders List'
          browserTitle='BCH Orders List'
        >
          <Row>
            {orderData && (
              <Col xs={12}>
                <Details order={orderData} onClose={_this.handleClose} onTake={_this.handleTake} />
              </Col>
            )}
            <Col xs={12}>
              <Box title='Order List'>
                <DataTable
                  id='OrdersTable'
                  className='order-table'
                  columns={_this.firstColumns}
                  data={data}
                  options={{
                    paging: true,
                    lengthChange: false,
                    searching: false,
                    ordering: false,
                    info: true,
                    autoWidth: false
                  }}
                  onClickEvents={{
                    onClickEvent: (data, rowIdx, rowData) => {
                      console.log(data)
                      if (data.key === 'hashHandler') { _this.handleHashClick(data) }

                      if (data.key === 'takeHandler') { _this.handleTake(data) }
                    }
                  }}
                />
              </Box>
            </Col>
          </Row>
        </Content>
        {
        _this.state.showTakeModal && (
          <Content
            title='Taking order...'
            modal
            show={_this.state.showTakeModal}
            modalCloseButton
            onHide={_this.handleClose}
          >
            <div className='take-form-wrapper'>
              <div className='spinner'>
                <img alt='Loading...' src={Spinner} width={100} /><br />
                <p>Taking the other side of the trade...</p>
              </div>
            </div>
          </Content>
        )
        }
      </>
    )
  }

  async componentDidMount () {
    _this.handleOrders()

    // Get data and update the table
    // every 20 seconds
    setInterval(() => {
      _this.handleOrders()
    }, 30000)
  }

  async handleOrders () {
    const orders = await _this.getOrders()
    await _this.generateDataTable(orders)
  }

  // REST petition to Get data fron the pw2db
  async getOrders () {
    try {
      // console.log('SERVER: ', SERVER)

      const options = {
        method: 'GET',
        url: `${SERVER}/offer/list/`,
        data: {}
      }
      const result = await axios.request(options)
      // console.log('result.data', result.data)

      _this.setState({
        orders: result.data
      })

      return result.data
    } catch (err) {
      console.warn('Error in getOrders() ', err)
    }
  }

  // Generate table content
  async generateDataTable (dataArr = []) {
    try {
      const data = []
      // console.log(`dataArr: ${JSON.stringify(dataArr, null, 2)}`)

      if (!this.props.bchWallet) {
        console.log('BCH wallet is not initialized. Can not calculate price of BCH or tokens.')
        return
      }

      // Get the spot price for BCH.
      const bchSpotPrice = await this.props.bchWallet.getUsd()

      // console.log('bchSpotPrice: ', bchSpotPrice)

      for (let i = 0; i < dataArr.length; i++) {
        const order = dataArr[i]
        // console.log(`order: ${JSON.stringify(order, null, 2)}`)

        const satsTotal = Math.ceil(order.numTokens * order.rateInBaseUnit)
        console.log(`satsTotal: ${satsTotal}`)
        let usdTotal = bchSpotPrice * this.props.bchWallet.bchjs.BitcoinCash.toBitcoinCash(satsTotal)
        usdTotal = `$${this.props.bchWallet.bchjs.Util.floor8(usdTotal)}`

        const row = {
          ticker: order.ticker,
          tokenId: {
            tokenId: order.tokenId,
            subString: _this.cutString(order.tokenId)
          },
          // createdAt row data
          createdAt: new Date(order.timestamp).toLocaleString(),
          // Transaction id row data
          buyOrSell: order.buyOrSell,
          // Hash row data
          offerHash: {
            key: 'hashHandler',
            subString: _this.cutString(order.p2wdbHash),
            order: order.p2wdbHash,
            data: order
          },
          qty: order.numTokens,
          satsEach: order.rateInBaseUnit,
          satsTotal,
          usdTotal,
          orderStatus: order.offerStatus,
          take: {
            key: 'takeHandler',
            data: order
          }
        }
        data.push(row)
      }

      _this.setState({ data })
    } catch (err) {
      console.warn('Error in generateDataTable() ', err)
    }
  }

  cutString (txid) {
    try {
      const subTxid = txid.slice(0, 4)
      const subTxid2 = txid.slice(-4)
      return `${subTxid}...${subTxid2}`
    } catch (err) {
      console.warn('Error in cutString() ', err)
    }
  }

  handleHashClick (data) {
    try {
      //  data.isValid = data.isValid.toString()
      _this.setState({
        orderData: data
      })
    } catch (err) {
      _this.setState({
        orderData: null
      })
      console.warn('Error in handleHashClick() ', err)
    }
  }

  handleClose () {
    _this.setState({
      orderData: null,
      showTakeModal: false
    })
  }

  async handleTake (order) {
    console.log('handleTake() order: ', order)

    const offerCid = order.data.p2wdbHash
    console.log('offerCid: ', offerCid)

    // if (!order.data.status === 'posted') return

    // TODO: Future functionality.
    // Throw up a modal to query how much they want to take.
    // _this.setState({
    //   tankenInput: '',
    //   showTakeModal: true
    // })

    // Show the modal
    _this.setState({
      showTakeModal: true
    })

    const options = {
      method: 'POST',
      url: `${SERVER}/offer/take/`,
      data: {
        offerCid
      }
    }
    const result = await axios.request(options)
    console.log('result of taking offer: ', result)

    // Hide the modal
    _this.setState({
      showTakeModal: false
    })
  }

  handleModalInputs (event) {
    const value = event.target.value
    _this.setState({
      [event.target.name]: value
    })
  }
}

export default Orders
