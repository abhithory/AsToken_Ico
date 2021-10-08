const { assert } = require('chai');

var AsToken = artifacts.require("AsToken");
var AsTokenSale = artifacts.require("AsTokenSale");


require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('AsTokenSale Ico', (accounts) => {

    let AsTokenContract, AsTokenSaleContract;
    var admin;
    var buyer = accounts[1];
    var tokenPrice; // in wei
    var tokenAvailabel = 1000;
    var numberOfTokens;

    before(async () => {
        AsTokenContract = await AsToken.deployed();
        AsTokenSaleContract = await AsTokenSale.deployed();
    })


    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await AsTokenSaleContract.address;
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })


        it('deatils are correct', async () => {
            admin = await AsTokenSaleContract.admin();
            tokenPrice = await AsTokenSaleContract.tokenPrice();
            const balance = await AsTokenContract.balanceOf(AsTokenSaleContract.address);

            assert.equal(admin, accounts[0]);
            assert.equal(tokenPrice.toNumber(), 1000000000000000);
            assert.equal(balance.toNumber(), 0)
        })
    })

    describe('token buying', async () => {

        it('succefully transfer tokens to TokenSale Contract', async () => {
            const balanceOfadmin0 = await AsTokenContract.balanceOf(admin);
            await AsTokenContract.transfer(AsTokenSaleContract.address, tokenAvailabel, { from: admin });
            const balanceOfadmin1 = await AsTokenContract.balanceOf(admin);
            assert.equal(balanceOfadmin0 - balanceOfadmin1, 1000)
        })
        it('succefully buy tokens', async () => {

            numberOfTokens = 100;
            const buyTokenByBuyer = await AsTokenSaleContract.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });

            assert.equal(buyTokenByBuyer.logs.length,1,'triggers one event');
            assert.equal(buyTokenByBuyer.logs[0].event,'Sell','should be the "Sell" event');
            assert.equal(buyTokenByBuyer.logs[0].args._buyer,buyer,'logs the account that purchase the tokens');
            assert.equal(buyTokenByBuyer.logs[0].args._amount,numberOfTokens,'logs the number of tokens purchased');
            const tokenSold = await AsTokenSaleContract.tokensSold();
            assert.equal(tokenSold.toNumber(),numberOfTokens,'increments the number of tokens sold');
            const balanceRemained = await AsTokenContract.balanceOf(AsTokenSaleContract.address);
            assert.equal(balanceRemained.toNumber(), 1000 - numberOfTokens);

            AsTokenSaleContract.buyTokens(900000000,{from:buyer, value: numberOfTokens * tokenPrice}).should.be.rejected;

            const gotEthValue = await AsTokenSaleContract.amountForWithdraw();
            assert.notEqual(gotEthValue,0,'ETH value that we got');


        })
    })

    describe('end token sale', async() => {
        it('succefully end token sale',async()=>{

            await AsTokenSaleContract.endSale({from:buyer}).should.be.rejected;

            await AsTokenSaleContract.endSale({from:admin});

            const balanceEndSale = await AsTokenContract.balanceOf(admin);
            assert.equal(balanceEndSale.toNumber(),1000000-100,'retuns all unsold tokens to admin')
        })

        it('succefully witdraw ETH ',async()=>{

            await AsTokenSaleContract.withdraw('0xE86d8A31d675AFa42C91F4d5a03E96B4460DdD3f',{from:buyer}).should.be.rejected;

            await AsTokenSaleContract.withdraw('0xE86d8A31d675AFa42C91F4d5a03E96B4460DdD3f',{from:admin});

            const gotEthValueAfterWithdraw = await AsTokenSaleContract.amountForWithdraw();
            assert.equal(gotEthValueAfterWithdraw,0,'ETH value after widraw');
            
        })
    })

})