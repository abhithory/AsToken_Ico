import React, { Component } from 'react';
import Web3 from 'web3';
import AsTokenJson from '../abis/AsToken.json'
import AsTokenICOJson from '../abis/AsTokenSale.json'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle'
import './App.css';
import Navbar from './Navbar'
import Main from './Main'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
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
      window.alert('As Token contract not deployed to detected network.')
    }
  }

  buyAsTokens = async (_noOfTokens) => {
    this.setState({ loading: true })

    const valueOfTokens = this.state.asTokenPriceWei * _noOfTokens;
    await this.state.asTokenIcoContract.methods.buyTokens(_noOfTokens)
      .send({ from: this.state.account, value: valueOfTokens })
      .on('transactionHash', (hash) => {
        this.loadBlockchainData();
      })
      .on('receipt', (receipt) => {
        this.loadBlockchainData();
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        this.loadBlockchainData();

      })
      .on('error', (error, receipt) => {
        this.loadBlockchainData();
      });
  }

  witdrawEth = async (_userAddress) => {
    console.log(_userAddress)

    await this.state.asTokenIcoContract.methods.withdraw(_userAddress)
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.loadBlockchainData();
      })
      .on('receipt', (receipt) => {
        this.loadBlockchainData();
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        this.loadBlockchainData();

      })
      .on('error', (error, receipt) => {
        this.loadBlockchainData();
      });
  }

  stopIco = async () => {

    await this.state.asTokenIcoContract.methods.endSale()
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.loadBlockchainData();
      })
      .on('receipt', (receipt) => {
        this.loadBlockchainData();
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        this.loadBlockchainData();

      })
      .on('error', (error, receipt) => {
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
      loading: true
    }

    this.buyAsTokens = this.buyAsTokens.bind(this)
    this.witdrawEth = this.witdrawEth.bind(this)
    this.stopIco = this.stopIco.bind(this)
    
  }


  render() {
    return (
      <div className="d-flex flex-column bg-light bg-gradient" style={{ height: '100vh' }}>
        <Navbar account={this.state.account} isDeployer={this.state.isDeployer} availableEthForWithdraw={this.state.availableEthForWithdraw} witdrawEth={this.witdrawEth} stopIco={this.stopIco}/>
        {this.state.loading
          ?
          <div className="text-center m-5">
            <div className="spinner-border" role="status">
            </div>
          </div>
          :
          <Main account={this.state.account} asTokenPrice={this.state.asTokenPrice} asTokenBalance={this.state.asTokenBalance} tokensForSell={this.state.tokensForSell} tokensSold={this.state.tokensSold} buyAsTokens={this.buyAsTokens} />
        }
      </div>
    );
  }
}

export default App;
