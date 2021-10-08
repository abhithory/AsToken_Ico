import React, { Component } from 'react';
import Web3 from 'web3';
import AsTokenJson from '../abis/AsToken.json'
import AsTokenICOJson from '../abis/AsTokenSale.json'

import 'bootstrap/dist/css/bootstrap.css'
import './App.css';
import Navbar from './Navbar'
import Main from './Main'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      await this.loadBlockchainData()

    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      await this.loadBlockchainData()

    }
    else {
      this.setState({ connected: false })
      
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    web3.eth.defaultAccount = accounts[0];
    this.setState({ account: accounts[0] })


    const networkId = await web3.eth.net.getId()
    const asTokenNetworkData = AsTokenJson.networks[networkId]
    const asTokenNetworkICOData = AsTokenICOJson.networks[networkId]

    if (asTokenNetworkData && asTokenNetworkICOData) {
      const asTokenContract = web3.eth.Contract(AsTokenJson.abi, asTokenNetworkData.address);
      this.setState({ asTokenContract })

      const asTokenIcoContract = web3.eth.Contract(AsTokenICOJson.abi, asTokenNetworkICOData.address);
      this.setState({ asTokenIcoContract });

      const deployerAddress = await asTokenIcoContract.methods.admin().call();
      if (deployerAddress == this.state.account) {
        this.setState({ isDeployer: true })
      } else {
        this.setState({ isDeployer: false })
      }

      const asTokenBalance = await asTokenContract.methods.balanceOf(this.state.account).call();
      this.setState({ asTokenBalance: asTokenBalance.toNumber() })

      const asTokenPriceWei = await asTokenIcoContract.methods.tokenPrice().call();
      this.setState({ asTokenPriceWei: asTokenPriceWei.toNumber() })

      const asTokenPrice = web3.utils.fromWei(asTokenPriceWei.toString(), 'ether');
      this.setState({ asTokenPrice })

      const tokensForSell = await asTokenIcoContract.methods.tokensForSell().call();
      this.setState({ tokensForSell: tokensForSell.toNumber() })

      const tokensSold = await asTokenIcoContract.methods.tokensSold().call();
      this.setState({ tokensSold: tokensSold.toNumber() })

      const availableEthForWithdrawWei = await asTokenIcoContract.methods.amountForWithdraw().call();
      const availableEthForWithdraw = web3.utils.fromWei(availableEthForWithdrawWei.toString(), 'ether');
      this.setState({ availableEthForWithdraw })

      this.setState({ loading: false })

    } else {
      this.setState({ connected: false })
    }
  }

  buyAsTokens = async (_noOfTokens) => {
    this.setState({ loading: true })

    const valueOfTokens = this.state.asTokenPriceWei * _noOfTokens;
    await this.state.asTokenIcoContract.methods.buyTokens(_noOfTokens)
      .send({ from: this.state.account, value: valueOfTokens })
      .on('transactionHash', (hash) => {
        console.log('transactionHash', hash)
      })
      .on('receipt', (receipt) => {

      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log('receipt', receipt)
        this.loadBlockchainData();

      })
      .on('error', (error, receipt) => {
        console.log('error', error)
        this.loadBlockchainData();
      });
  }

  witdrawEth = async (_userAddress) => {
    console.log(_userAddress)

    await this.state.asTokenIcoContract.methods.withdraw(_userAddress)
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        console.log('transactionHash', hash)

      })
      .on('receipt', (receipt) => {
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log('receipt', receipt)
        this.loadBlockchainData();

      })
      .on('error', (error, receipt) => {
        console.log('error', error)
        this.loadBlockchainData();
      });
  }

  stopIco = async () => {

    await this.state.asTokenIcoContract.methods.endSale()
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        console.log('transactionHash', hash)
      })
      .on('receipt', (receipt) => {
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log('receipt', receipt)
        this.loadBlockchainData();

      })
      .on('error', (error, receipt) => {
        console.log('error', error)
        this.loadBlockchainData();
      });
  }


  constructor(props) {
    super(props)
    this.state = {
      asTokenContract: null,
      asTokenIcoContract: null,
      asTokenPrice: 0,
      asTokenPriceWei: 0,
      asTokenBalance: 0,
      tokensForSell: 0,
      tokensSold: 0,
      availableEthForWithdraw: 0,
      account: '',
      isDeployer: false,
      connected: true,
      loading: true
    }

    this.buyAsTokens = this.buyAsTokens.bind(this)
    this.witdrawEth = this.witdrawEth.bind(this)
    this.stopIco = this.stopIco.bind(this)

  }


  render() {
    return (
      <div className="d-flex flex-column bg-light bg-gradient" style={{ height: '100vh' }}>
        {this.state.connected
          ?
          <>
            <Navbar account={this.state.account} isDeployer={this.state.isDeployer} availableEthForWithdraw={this.state.availableEthForWithdraw} witdrawEth={this.witdrawEth} stopIco={this.stopIco} />
            {this.state.loading
              ?
              <div className="text-center m-5">
                <div className="spinner-border" role="status">
                </div>
              </div>
              :
              <Main account={this.state.account} asTokenPrice={this.state.asTokenPrice} asTokenBalance={this.state.asTokenBalance} tokensForSell={this.state.tokensForSell} tokensSold={this.state.tokensSold} buyAsTokens={this.buyAsTokens} />
            }
          </>
          :
          <div className="container text-center">
            <h1 className="mt-3 text-primary">Please Connect to Ropsten test network</h1>
            <a href="https://faucet.ropsten.be/" target="_blank" className="btn btn-success">Get free Ether for Ropsten test network</a>
            <h4 className="my-3">Follow these instructions for connect metamask with Ropsten test network</h4>
            <hr/>
            
            <h6>1. Install  <a href="https://metamask.io/download.html" target="_blank" className="btn btn-outline-primary">Meta-mask</a></h6>
            <h6>2. Create Your Account</h6>
            <h6>3. Connect with Ropsten test network</h6>
            <h6>4. Get Some Free Ether by Ropsten Faucet</h6>
            <hr/>
            <img className="img-fluid h-50" src="img/ropston.jpg" alt="" />

          </div>
        }
      </div>
    );
  }
}

export default App;
