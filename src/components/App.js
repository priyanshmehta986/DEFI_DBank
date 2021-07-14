// import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'

import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()

      //load balance
      if (typeof accounts[0] !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({ account: accounts[0], balance: balance, web3: web3 })
      } else {
        window.alert('Please login with MetaMask')
      }

      //load contracts
      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
        const dBankAddress = dBank.networks[netId].address

        // var withdrawEvent = bank.Withdraw()


        this.setState({ token: token, dbank: dbank, dBankAddress: dBankAddress })
      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    } else {
      window.alert('Please install MetaMask')
    }
  }

  async deposit(amount) {

    this.setState({ loading: true })
    if (this.state.dbank !== 'undefined') {
      try {
        await this.state.dbank.methods.deposit().send({ value: amount, from: this.state.account }).on('transactionHash', (hash) => {
          this.setState({ loading: false })
        })
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }


  async withdraw(amount) {
    this.setState({ loading: true })
    if (this.state.dbank !== 'undefined') {
      try {
        await this.state.dbank.methods.withdraw().send({ value: amount, from: this.state.account }).on('transactionHash', (hash) => {
          this.setState({ loading: false })
        })
      } catch (e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }

  async borrow(amount) {
    this.setState({ loading: true })
    if (this.state.dbank !== 'undefined') {
      try {
        await this.state.dbank.methods.borrow().send({ value: amount.toString(), from: this.state.account }).on('transactionHash', (hash) => {
          this.setState({ loading: false })
        })
      } catch (e) {
        console.log('Error, borrow: ', e)
      }
    }
  }


  async payOff(amount) {
    this.setState({ loading: true })
    if (this.state.dbank !== 'undefined') {
      try {
        // const collateralEther = await this.state.dbank.methods.collateralEther(this.state.account).call({ from: this.state.account })
        // const tokenBorrowed = collateralEther / 2
        // await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({ from: this.state.account })
        await this.state.dbank.methods.payOff().send({ value: amount, from: this.state.account }).on('transactionHash', (hash) => {
          this.setState({ loading: false })
        })
      } catch (e) {
        console.log('Error, pay off: ', e)
      }
    }
  }

  async borrowedAmount(e) {
    e.preventDefault()
    await this.state.dbank.methods.tokenMint(this.state.account).call({ from: this.state.account })
    document.getElementById("borrowed").innerHTML = "Borrowed Amount : " + await this.state.dbank.methods.tokenMint(this.state.account).call({ from: this.state.account }) * (10 ** -18)
  }

  async etherBalance(e) {
    e.preventDefault()
    // await this.state.dbank.methods.etherBalance().call({ from: this.state.account })
    document.getElementById("demo").innerHTML = "Deposits : " + await this.state.dbank.methods.etherBalance().call({ from: this.state.account }) * (10 ** -18)
    // const tokenBorrowed = collateralEther / 2
    // await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({ from: this.state.account })
    // await this.state.dbank.methods.payOff().send({ from: this.state.account })cz
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      amount: ''
    }

    this.etherBalance = this.etherBalance.bind(this);
    // this.newBalance = this.newBalance.bind(this);


  }

  render() {
    return (
      <div>
        {this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <div className="app-container">
            <Navbar></Navbar>
            <div className="app-content">
              <Sidebar></Sidebar>
              <div className="projects-section">
                <div className="projects-section-header">
                  <p>Swap
                    <br />
                    <br />
                    <p style={{ fontSize: `18px` }}>Address : {this.state.account}</p>
                    <p style={{ fontSize: `18px` }} id="#withdrawAmount">Balance : {this.state.balance * (10 ** -18)}</p>
                    <button onClick={(e) => {
                      e.preventDefault()
                      this.etherBalance(e)
                    }} className='btn btn-primary' style={{ fontSize: `18px` }} id="demo">Show Deposits</button>
                    <button onClick={(e) => {
                      e.preventDefault()
                      this.borrowedAmount(e)
                    }} className='btn btn-primary' style={{ fontSize: `18px` }} id="borrowed">Borrowed Amount</button>
                  </p>

                  <p className="time">...</p>
                </div>
                <div className="project-boxes jsGridView">
                  <div className="project-box-wrapper">
                    <div className="project-box" >
                      {/* <div className="project-box-header">
                    <span>December 10, 2020</span>
                  </div> */}
                      <div className="project-box-content-header">
                        <p className="box-content-header">Deposit</p>
                        {/* <p className="box-content-subheader">Prototyping</p> */}
                        {/* <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                      <Tab eventKey="deposit" title="Deposit"> */}
                        <div className="box-content-subheader">
                          <br></br>
                          How much do you want to deposit?
                          <br></br>
                          (min. amount is 0.01 ETH)
                          <br></br>
                          (1 deposit is possible at the time)
                          <br></br>

                          <form onSubmit={(e) => {
                            e.preventDefault()
                            let amount = this.depositAmount.value
                            amount = amount * 10 ** 18 //convert to wei
                            this.deposit(amount)
                            // this.ContractInstance.events.Deposit({}, (error, data) => {
                            //   if (error)
                            //     console.log("Error: " + error);
                            //   else
                            //     console.log("Log data: " + data);
                            // });
                          }}>
                            <div className='form-group mr-sm-2'>
                              <br></br>
                              <input
                                id='depositAmount'
                                step="0.01"
                                type='number'
                                ref={(input) => { this.depositAmount = input }}
                                className="form-control form-control-md"
                                placeholder='Enter Deposit Amount'
                                required />
                            </div>
                            <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                          </form>

                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="project-box-wrapper">
                    <div className="project-box">
                      {/* <div className="project-box-header">
                    <span>December 10, 2020</span>
                  </div> */}
                      <div className="project-box-content-header">
                        <p className="box-content-header">Withdraw</p>
                        {/* <p className="box-content-subheader">Prototyping</p> */}
                        {/* <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                      <Tab eventKey="withdraw" title="Withdraw"> */}
                        <div className="box-content-subheader">
                          <br></br>
                          <br />
                          Do you want to withdraw + take interest?
                          <br></br>
                          <br></br>
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            let amount = this.withdrawAmount.value
                            amount = amount * 10 ** 18 //convert to wei
                            this.withdraw(amount)
                            console.log(amount)
                            // this.newBalance(e)

                          }}>
                            <div className='form-group mr-sm-2'>
                              <br></br>
                              <input
                                id='withdrawAmount'
                                step="0.01"
                                type='number'
                                ref={(input) => { this.withdrawAmount = input }}
                                className="form-control form-control-md"
                                placeholder='Enter Withdraw Amount'
                                required />
                            </div>
                            <button type='submit' className='btn btn-primary'>WITHDRAW</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="project-box-wrapper">
                    <div className="project-box">
                      {/* <div className="project-box-header">
                    <span>December 10, 2020</span>
                  </div> */}
                      <div className="project-box-content-header">
                        <p className="box-content-header">Borrow</p>
                        <div className="box-content-subheader">
                          <br></br>
                          Do you want to borrow tokens?
                          <br></br>
                          (You'll get 50% of collateral, in Tokens)
                          <br></br>
                          Type collateral amount (in ETH)
                          <br></br>
                          <br></br>
                          <form onSubmit={(e) => {

                            e.preventDefault()
                            let amount = this.borrowAmount.value
                            amount = amount * 10 ** 18 //convert to wei
                            this.borrow(amount)
                          }}>
                            <div className='form-group mr-sm-2'>
                              <input
                                id='borrowAmount'
                                step="0.01"
                                type='number'
                                ref={(input) => { this.borrowAmount = input }}
                                className="form-control form-control-md"
                                placeholder='Enter Borrow Amount'
                                required />
                            </div>
                            <button type='submit' className='btn btn-primary'>BORROW</button>
                          </form>
                        </div>
                        {/* </Tab>
                      </Tabs> */}
                      </div>
                    </div>
                  </div>

                  <div className="project-box-wrapper">
                    <div className="project-box">
                      {/* <div className="project-box-header">
                    <span>December 10, 2020</span>
                  </div> */}
                      <div className="project-box-content-header">
                        <p className="box-content-header">Payoff</p>
                        {/* <p className="box-content-subheader">Prototyping</p> */}
                        {/* <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                      <Tab eventKey="payOff" title="Payoff"> */}
                        <div className="box-content-subheader">
                          <br></br>
                          <br />
                          Do you want to payoff the loan?
                          <br></br>
                          (You'll receive your collateral - fee)
                          <br></br>
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            let amount = this.payoffAmount.value
                            amount = amount * 10 ** 18 //convert to wei
                            this.payOff(amount)
                            console.log(amount)
                            // this.newBalance(e)

                          }}>
                            <div className='form-group mr-sm-2'>
                              <br></br>
                              <input
                                id='payoffAmount'
                                step="0.01"
                                type='number'
                                ref={(input) => { this.payoffAmount = input }}
                                className="form-control form-control-md"
                                placeholder='Enter Payoff Amount'
                                required />
                            </div>
                            <button type='submit' className='btn btn-primary'>PAYOFF</button>
                          </form>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div >
            </div>
          </div>
        }
      </div>
    );
  }
}
export default App;