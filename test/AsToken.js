var AsToken = artifacts.require("AsToken");

require('chai')
  .use(require('chai-as-promised'))
  .should()


contract('AsToken', (accounts) => {
  let AsTokenContract;
  before(async () => {
    AsTokenContract = await AsToken.deployed();
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await AsTokenContract.address;
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('Name symbol total supply is correct', async () => {
      const name = await AsTokenContract.name();
      const symbol = await AsTokenContract.symbol();
      const version = await AsTokenContract.version();
      const totalSupply = await AsTokenContract.totalSupply();
      const balance = await AsTokenContract.balanceOf(accounts[0]);
      assert.equal(name, "As Token")
      assert.equal(symbol, "AS")
      assert.equal(version, "As Token v1.0")
      assert.equal(totalSupply.toNumber(), 1000000)
      assert.equal(balance.toNumber(), 1000000)
    })
  })

  describe('transfering tokens', async () => {
    it('succefully transferred token to another account', async () => {
      const transferToken = await AsTokenContract.transfer(accounts[1], 1000, { from: accounts[0] });
      // console.log(transferToken.logs[0].args);
      const balance0 = await AsTokenContract.balanceOf(accounts[0]);
      const balance1 = await AsTokenContract.balanceOf(accounts[1]);
      assert.equal(transferToken.logs.length, 1, 'triggers one event');
      assert.equal(transferToken.logs[0].event, 'Transfer', 'should be the "tranfer" event');
      assert.equal(transferToken.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
      assert.equal(transferToken.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
      assert.equal(transferToken.logs[0].args._value.toNumber(), 1000, 'logs the transfer amount');
      assert.equal(balance1.toNumber(), 1000, 'logs the transfer amount');
      assert.equal(balance0.toNumber(), 1000000 - 1000, 'logs the transfer amount');
    })
  })

  describe('approve token for delegated transfer', async () => {
    it('succefully approved token for another account', async () => {

      const approveToken = await AsTokenContract.approve(accounts[1], 1000, { from: accounts[0] });
      // console.log(transferToken.logs[0].args);
      const allowanceBalance = await AsTokenContract.allowance(accounts[0], accounts[1]);

      assert.equal(approveToken.logs.length, 1, 'triggers one event');
      assert.equal(approveToken.logs[0].event, 'Approval', 'should be the "Approval" event');
      assert.equal(approveToken.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
      assert.equal(approveToken.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
      assert.equal(approveToken.logs[0].args._value, 1000, 'logs the transfer amount');
      assert.equal(allowanceBalance.toNumber(), 1000,);

    })
  })

  describe('delegated token tranfers', async () => {
    let fromAccount, toAccount, spendingAccount;

    it('succefuuly transfer delegated tokens', async () => {
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4];

      await AsTokenContract.transfer(fromAccount, 100, { from: accounts[0] });

      await AsTokenContract.approve(spendingAccount, 50, { from: fromAccount });

      await AsTokenContract.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount }).should.be.rejected;

      const tranferedFrom = await AsTokenContract.transferFrom(fromAccount, toAccount, 40, { from: spendingAccount });

      assert.equal(tranferedFrom.logs.length, 1, 'triggers one event');
      assert.equal(tranferedFrom.logs[0].event, 'Transfer', 'should be the "tranfer" event');
      assert.equal(tranferedFrom.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
      assert.equal(tranferedFrom.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
      assert.equal(tranferedFrom.logs[0].args._value.toNumber(), 40, 'logs the transfer amount');

      await AsTokenContract.transferFrom(fromAccount, toAccount, 50, { from: spendingAccount }).should.be.rejected;

      const balancefromAccount = await AsTokenContract.balanceOf(fromAccount);
      const balancetoAccount = await AsTokenContract.balanceOf(toAccount);
      const allowancebalance = await AsTokenContract.allowance(fromAccount, spendingAccount);

      assert.equal(balancefromAccount.toNumber(),60 );
      assert.equal(balancetoAccount.toNumber(),40);
      assert.equal(allowancebalance.toNumber(),10);
    })
  })


})