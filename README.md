# Hardhat ERC20 Token and Token Sale Project

This project contains two smart contracts:

1. **MyToken**: An ERC20 token with a total supply of 21 million.
2. **TokenSale**: A token sale contract to sell the ERC20 token at a rate of 1 token = 0.01 ETH, with tokens released to buyers after 365 days of purchase.

The contracts are deployed and verified on the Polygon Amoy Testnet.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [Hardhat](https://hardhat.org/)
- A wallet with funds on the Polygon Amoy Testnet

## Project Setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```
3. Add a `.env` file with the following content:

   ```plaintext
   PRIVATE_KEY=your_wallet_private_key
   INFURA_API_KEY=your_infura_project_id
   AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/your_infura_project_id
   ```

   Replace `your_wallet_private_key` and `your_infura_project_id` with your actual wallet private key and Infura project ID.

## Compilation

To compile the contracts, run:

```bash
npx hardhat compile
```

## Testing

To test the contracts, run:

```bash
npx hardhat test
```

## Deployment

To deploy the contracts to the Polygon Amoy Testnet, run:

```bash
npx hardhat run ./scripts/deploy.js --network amoy
```

The deployment script will:

1. Deploy the **MyToken** contract.
2. Deploy the **TokenSale** contract.
3. Transfer 21 million tokens from the **MyToken** contract to the **TokenSale** contract.

## Verified Contracts

The deployed contracts are verified on the Polygon Amoy Testnet:

- **MyToken**: [View on Polygonscan](https://amoy.polygonscan.com/address/0x119e67a01C4B5bec054c00925d9D989b52eC19DE#code)
- **TokenSale**: [View on Polygonscan](https://amoy.polygonscan.com/address/0x7b661bAB67FE821dD8a088C72C18350ec3508634#code)

## Additional Information

- **Token Sale Rate**: 1 token = 0.01 ETH.
- **Token Release**: Purchased tokens are locked and released 365 days after purchase.

## Commands Summary

| Command                                   | Description                                   |
|-------------------------------------------|-----------------------------------------------|
| `npx hardhat compile`                     | Compile the smart contracts                  |
| `npx hardhat test`                        | Run the test suite                           |
| `npx hardhat run ./scripts/deploy.js`     | Deploy the contracts                         |

