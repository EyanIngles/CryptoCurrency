const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
     return ethers.utils.parseUnits(n.toString(), "ether")
}

describe ("Token", () => {

    let token, accounts, deployer, receiver, exchange


    beforeEach(async ()  => {
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy("Ease", "ESE", "1000000")
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[0]
    })

describe("deployment", () =>{
    const name = "Ease"
    const symbol = "ESE"
    const decimals = "18"
    const totalSupply = tokens("1000000")

    it("has a name", async () =>  {
        expect(await token.name()).to.equal(name)
    })
    it("has a symbol", async () =>  {
        expect(await token.symbol()).to.equal(symbol)
    })
    it("has a correct decimals", async () =>  {
        expect(await token.decimals()).to.equal(decimals)
    })
    it("has a correct total supply", async () =>  {
        expect(await token.totalSupply()).to.equal(totalSupply)
    })
    it("has a correct total supply to deployer", async () =>  {
        expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
    })
})
describe('Successful Tests', () => {
    let amount, transaction, result

        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).transfer(receiver.address, amount) // sending 100 * 18 ;
            result = await transaction.wait()
        })
    it('Tansfers token balances', async() => {
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
        expect(await token.balanceOf(receiver.address)).to.equal(amount)
    })
    it('Emits a transfer event', async() => {
        const eventLog = result.events[0]
        const args = eventLog.args

        expect(eventLog.event).to.equal("Transfer")
        expect(args.from).to.equal(deployer.address)
        expect(args.to).to.equal(receiver.address)
        expect(args.value).to.equal(amount)
    })

})
describe('sending tokens', () => {

    it('Rejects insufficient balances', async() => {
        const invalidAmount = tokens(10000000)
       // expect(await token.balanceOf(deployer.address)).to.equal(tokens(amount)).to.be.reverted
       await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
    })
    it('not a valid address', async() => {
        const amount = tokens(100)
       // expect(await token.balanceOf(deployer.address)).to.equal(tokens(amount)).to.be.reverted
       await expect(token.connect(deployer).transfer("0x8626f6940E2eb28930eFb4CeF49B29", amount)).to.be.reverted
    })
})
describe('approving Tokens', () => {
    let amount, transaction, result

    beforeEach(async () => {
        amount = tokens(100)
        transaction = await token.connect(deployer).approve(exchange.address, amount) // sending 100 * 18 ;
        result = await transaction.wait()

    })
    describe('Successful case', () => {
        it('allocates on allowance for delegated token spending',async () => {
            expect(await token.allowance(deployer.address, exchange.address))
        })
        it('Emits a approval event', async() => {
            const eventLog = result.events[0]
            const args = eventLog.args
            expect(eventLog.event).to.equal("Approval")
            expect(args.owner).to.equal(deployer.address)
            expect(args.spender).to.equal(exchange.address)
            expect(args.value).to.equal(amount)
        })
    })
    describe('Failure case', () => {
        it('rejects invalid spenders', async () => {
            await expect(token.connect(deployer).approve('1', amount)).to.be.reverted //tested with Hardhat address to ensure this test works.

        })
    })
})
})