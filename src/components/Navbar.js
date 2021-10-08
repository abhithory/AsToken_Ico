import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Navbar extends Component {

  withdrawEth = async () => {
    var userAddress = prompt('Enter Your Address Where you want to withdraw Ether');
    if (userAddress) {
      this.props.witdrawEth(userAddress);
    }
  }

  stopIco = async () => {

    var userAddress = prompt('Are You Sure? You Want To Stop As Token ICO. Enter 0 for stop ICO');
    if (userAddress == 0) {
      this.props.stopIco();
    }

  }

  render() {
    return (


      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="#"><b>As Token ICO</b></a>

          <div className="ms-auto d-md-flex align-items-center text-light">
            <h6 className="d-md-flex d-none me-2">{this.props.account}</h6>
            {this.props.account
              ? <img
                className='ml-2'
                width='30'
                height='30'
                src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
              />
              : <span></span>
            }
            {this.props.isDeployer
              ?
              <div className="">

                <button className="btn btn-warning mx-2" onClick={this.withdrawEth} title={`${this.props.availableEthForWithdraw} Ether`}>Widraw Eth</button>
                <button className="btn btn-danger mx-2" onClick={this.stopIco} title={`${this.props.availableEthForWithdraw} Ether`}>Stop Ico</button>
              </div>

              :
              <div className=""></div>
            }
          </div>


        </div>
      </nav>


    );
  }
}

export default Navbar;
