const { expect } = require("chai");
const { parseUnits, parseEther, formatEther } = require("ethers");

describe("TokenSale", function () {
  let token;
  let tokenSale;
  let buyer;
  let deployer;
  
  const tokenPrice = parseEther("0.01"); // 0.01 ETH per token
  const releaseDuration = 365 * 24 * 60 * 60; // 365 days in seconds
  const availableTokens = parseUnits("10000", 18); // 10,000 tokens

  beforeEach(async function () {
    // Get the signers
    [deployer, buyer] = await ethers.getSigners();

    // Deploy the token contract
    const Token = await ethers.getContractFactory("MyToken");
    token = await Token.deploy();
    const tokenAddress = await token.getAddress();

    // Deploy the TokenSale contract
    const TokenSale = await ethers.getContractFactory("TokenSale");
    tokenSale = await TokenSale.deploy(tokenAddress, tokenPrice, releaseDuration);
    const tokenSaleAddress = await tokenSale.getAddress();

    // Transfer available tokens to the tokenSale contract
    await token.transfer(tokenSaleAddress, availableTokens);
  });

  describe("Buying Tokens", function () {
    it("should allow users to buy tokens with ETH", async function () {
      const buyAmount = 100; // Buying 100 tokens
      const cost = buyAmount * parseFloat(formatEther(tokenPrice));

      // Buyer purchases tokens
      await expect(() =>
        tokenSale.connect(buyer).buyTokens(buyAmount, { value: parseEther(cost.toString()) })
      ).to.changeEtherBalance(buyer, -parseEther(cost.toString()));

      expect(await tokenSale.tokensPurchased(buyer.address)).to.equal(buyAmount);
      expect(await tokenSale.holdingTokens()).to.equal(buyAmount);
    });

    it("should revert if user tries to buy more than available tokens", async function () {
      const buyAmount = "20000"; // Buying more than available tokens (only 10,000 are available)
      const cost = buyAmount * parseFloat(formatEther(tokenPrice));

      await expect(
        tokenSale.connect(buyer).buyTokens(parseUnits(buyAmount, 18), { value: parseEther(cost.toString()) })
      ).to.be.revertedWith("Not enough tokens available for sale");
    });

    it("should revert if insufficient ETH is sent", async function () {
      const buyAmount = "100";
      const insufficientETH = parseEther("0.5");

      await expect(
        tokenSale.connect(buyer).buyTokens(parseUnits(buyAmount, 18), { value: insufficientETH })
      ).to.be.revertedWith("Insufficient funds to purchase tokens");
    });
  });

  describe("Claiming Tokens", function () {
    it("should allow users to claim tokens after the release duration", async function () {
      const buyAmount = "100"; // Buying 100 tokens
      const cost = buyAmount * parseFloat(formatEther(tokenPrice));
      await tokenSale.connect(buyer).buyTokens(parseUnits(buyAmount, 18), { value: parseEther(cost.toString()) });

      // Simulate waiting for 365 days
      await network.provider.send("evm_increaseTime", [releaseDuration + 1000]);
      await network.provider.send("evm_mine");

      // Buyer claims tokens
      await expect(tokenSale.connect(buyer).claimTokens())
        .to.emit(tokenSale, "TokensClaimed")
        .withArgs(buyer.address, parseUnits(buyAmount, 18).toString());

      expect(await tokenSale.holdingTokens()).to.equal(0);
      expect(await tokenSale.tokensPurchased(buyer.address)).to.equal(0);
    });

    it("should revert if user tries to claim tokens before the release duration", async function () {
      const buyAmount = "100";
      const cost = buyAmount * parseFloat(formatEther(tokenPrice));
      await tokenSale.connect(buyer).buyTokens(parseUnits(buyAmount, 18), { value: parseEther(cost.toString()) });

      // Trying to claim before 365 days
      await expect(tokenSale.connect(buyer).claimTokens()).to.be.revertedWith("Tokens are still locked");
    });
  });

  // describe("deployer Withdrawals", function () {
  //   it("should allow the deployer to withdraw ETH from the contract", async function () {
  //     const initialBalance = await ethers.provider.getBalance(deployer.address);

  //     const buyAmount = 100;
  //     const cost = buyAmount * parseFloat(formatEther(tokenPrice));
  //     await tokenSale.connect(buyer).buyTokens(parseUnits(buyAmount, 18), { value: parseEther(cost.toString()) });

  //     await expect(() => tokenSale.connect(deployer).withdrawETH())
  //       .to.changeEtherBalance(deployer, parseEther(cost.toString()));

  //     expect(await ethers.provider.getBalance(tokenSale.address)).to.equal(0);
  //   });

  //   it("should allow the deployer to withdraw tokens from the contract", async function () {
  //     const initialdeployerBalance = await token.balanceOf(deployer.address);

  //     const withdrawAmount = 5000; // Withdraw 5000 tokens
  //     await tokenSale.connect(deployer).withdrawTokens(withdrawAmount);

  //     expect(await token.balanceOf(deployer.address)).to.equal(initialdeployerBalance.add(withdrawAmount));
  //     expect(await tokenSale.holdingTokens()).to.equal(0); // Ensuring holding tokens were adjusted
  //   });

  //   it("should revert if deployer tries to withdraw more tokens than allowed", async function () {
  //     const withdrawAmount = 15000; // Trying to withdraw more than the available balance
  //     await expect(tokenSale.connect(deployer).withdrawTokens(withdrawAmount)).to.be.revertedWith(
  //       "Cannot withdraw tokens that are already purchased"
  //     );
  //   });
  // });

  // describe("Reentrancy Guard", function () {
  //   it("should prevent reentrancy attacks during token purchase", async function () {
  //     const buyAmount = 100;
  //     const cost = buyAmount * parseFloat(formatEther(tokenPrice));

  //     const attackerContract = await ethers.getContractFactory("ReentrancyAttack");
  //     const attackContract = await attackerContract.deploy(tokenSale.address);

  //     // Attacker tries to exploit the reentrancy vulnerability
  //     await expect(
  //       attackContract.connect(buyer).attack({ value: parseEther(cost.toString()) })
  //     ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  //   });
  // });
});
