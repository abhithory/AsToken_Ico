import React, { Component } from 'react';

class Main extends Component {
  componentDidMount() {

  }

  getValueOfRangeAndSetToInput() {
    let rangeValue = document.getElementById('wantToBuyTokenRange').value;
    document.getElementById('valueOfRange').value = rangeValue;
  }
  getValueOfInputAndSetToRange() {
    let rangeValue2 = document.getElementById('valueOfRange').value;
    document.getElementById('wantToBuyTokenRange').value = rangeValue2;
  }

  getTokenSoldProgress = () => {
    let tokenSold = this.props.tokensSold;
    let tokenForSell = this.props.tokensForSell;

    let progress = (tokenSold / tokenForSell) * 100
    return progress;
  }
  
  buyAsTokens = async () => {

    var tokensCount = document.getElementById('valueOfRange').value;
    if (tokensCount) {
      this.props.buyAsTokens(tokensCount);
    } else {
      var alertPlaceholder = document.getElementById('liveAlertPlaceholder')
      var wrapper = document.createElement('div')
      wrapper.innerHTML = '<div className="alert alert-' + 'danger' + ' alert-dismissible" role="alert">' + 'Please Enter How much tokens do you want??' + '<button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
      alertPlaceholder.append(wrapper)
    }
  }



  render() {
    return (
      <>
        <div className="d-flex flex-column justify-content-between container text-center" style={{ height: '100%' }} >

          {/* top bar */}
          <div id="content" className="text-center" >
            <h1 className="mt-5">
              Welcome to "<b><i>As</i></b> Token ICO!"
            </h1>
            <p className="">As Token price is <b className="">{this.props.asTokenPrice}</b> Ether. You currently have <b className="">{this.props.asTokenBalance} AS</b></p>
            <br />

          </div>

          {/* body */}
          <div className="">
            <div className="slidecontainer">
              <input type="range" className=" slider" id="wantToBuyTokenRange" min="1" max={this.props.tokensForSell - this.props.tokensSold} step="1" onChange={this.getValueOfRangeAndSetToInput} />
            </div>
            <div className="d-flex justify-content-center align-items-stretch  mt-3 mb-2 ">
              <div className="input-group news-input" style={{ width: '60%' }}>
                <input onChange={this.getValueOfInputAndSetToRange} id="valueOfRange" placeholder="How Much tokens do you want??" className="form-control input-lg" type="number" min="1" max={this.props.tokensForSell - this.props.tokensSold} />
              </div>
            </div>
            <div id="liveAlertPlaceholder"></div>
            

            <button onClick={this.buyAsTokens} className="btn btn-primary btn-lg" type="button">Buy Token Now</button>
           

          </div>

          <div className="">

            <div className="progress">
              <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${this.getTokenSoldProgress()}%` }}></div>

            </div>
            <p>
              <span className="token-sold"></span> {this.props.tokensSold}/{this.props.tokensForSell} <span className="tokens-available"></span> tokens Sold
            </p>
            <hr />
            <p id="accountAddress">{this.props.account}</p>
          </div>

        </div>


        {/* foo */}


      </>


    );
  }
}

export default Main;
