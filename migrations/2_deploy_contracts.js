const AsToken = artifacts.require("AsToken");
const AsTokenSale = artifacts.require("AsTokenSale");


module.exports = async function (deployer, network, accounts) {

  await deployer.deploy(AsToken, "As Token", "AS", "As Token v1.0", 1000000);
  const asToken = await AsToken.deployed();

  var tokenPrice = 1000000000000000; //in wei 
  var tokensForSale = 100000;

  await deployer.deploy(AsTokenSale, asToken.address, tokenPrice,tokensForSale);
  const asTokenSale = await AsTokenSale.deployed();

  await asToken.transfer(asTokenSale.address, tokensForSale)
  

};
