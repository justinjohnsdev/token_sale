const { ethers, upgrades } = require("hardhat");

// Constants
const SECONDS_IN_A_DAY = 86400; // Seconds in a day
const RELEASE_DURATION = 365 * SECONDS_IN_A_DAY; // 365 days in seconds
const TOKEN_PRICE = "10000000000000000"; // 0.01 ETH per token (in Wei)
const TOKEN_SUPPLY = BigInt(21_000_000) * BigInt(10**18); // 21 million tokens (in Wei)

async function main() {
  // Get the deployer's address (this will be the initial owner)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MyToken contract (token with 21 million supply)
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy();  // Pass the deployer's address as the initial owner
  const tokenAddress = await token.getAddress()
  console.log("MyToken deployed to:", tokenAddress);

  // Deploy TokenSale contract with token address, token price, and release duration
  const TokenSale = await ethers.getContractFactory("TokenSale");
  const tokenSale = await TokenSale.deploy(tokenAddress, TOKEN_PRICE, RELEASE_DURATION);
  const tokenSaleAddress = await tokenSale.getAddress()
  console.log("TokenSale deployed to:", tokenSaleAddress);

  // Transfer 21 million tokens to the sale contract for the users to buy
  const transferTx = await token.transfer(tokenSaleAddress, TOKEN_SUPPLY);
  await transferTx.wait();
  console.log(`Transferred ${TOKEN_SUPPLY} tokens to the TokenSale contract`);

  // Output the addresses for reference
  console.log(`MyToken contract address: ${tokenAddress}`);
  console.log(`TokenSale contract address: ${tokenSaleAddress}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
