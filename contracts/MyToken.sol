// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {

    uint256 public constant MAX_SUPPLY = 21_000_000 * (10 ** 18); // 21 million tokens, assuming 18 decimal places

    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        // Mint the full supply to the contract deployer's address
        _mint(msg.sender, MAX_SUPPLY);
    }

    // Preventing minting after deployment (the supply is fixed)
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}
