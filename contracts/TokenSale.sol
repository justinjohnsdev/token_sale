// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TokenSale is Ownable, ReentrancyGuard {
    IERC20 public token;

    uint256 public tokenPrice;
    uint256 public releaseDuration;

    uint256 public holdingTokens;  // Tokens currently held for purchase

    // Mapping to track the amount of tokens purchased by each user
    mapping(address => uint256) public tokensPurchased;

    // Mapping to track the purchase timestamp for each user
    mapping(address => uint256) public purchaseTime;

    // Event to log token purchases and claims
    event TokensPurchased(address indexed buyer, uint256 amount);
    event TokensClaimed(address indexed buyer, uint256 amount);
    event TokensWithdrawn(address indexed owner, uint256 amount);

    // Constructor: Initialize the sale contract
    constructor(address _token, uint256 _tokenPrice, uint256 _releaseDuration ) Ownable(msg.sender){
        token = IERC20(_token);
        tokenPrice = _tokenPrice;
        releaseDuration = _releaseDuration; // 365 days in seconds
    }

    // Function to purchase tokens
    function buyTokens(uint256 _amount) external payable nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");

        uint256 availableBalance = token.balanceOf(address(this)); // Get available tokens in the contract
        require(availableBalance >= holdingTokens + _amount, "Not enough tokens available for sale");

        uint256 cost = _amount/10**18 * tokenPrice;
        require(msg.value >= cost, "Insufficient funds to purchase tokens");

        // Update holding tokens and purchased amount for the buyer
        holdingTokens += _amount;
        tokensPurchased[msg.sender] += _amount;
        purchaseTime[msg.sender] = block.timestamp;

        emit TokensPurchased(msg.sender, _amount);
    }

    // Function to allow users to claim their tokens after 365 days
    function claimTokens() external nonReentrant {
        uint256 amount = tokensPurchased[msg.sender];
        require(amount > 0, "No tokens to claim");

        // Ensure that 365 days have passed since the purchase
        require(block.timestamp >= purchaseTime[msg.sender] + releaseDuration, "Tokens are still locked");

        // Reset the user's purchase information
        tokensPurchased[msg.sender] = 0;

        // Transfer the tokens to the user
        require(token.transfer(msg.sender, amount), "Token transfer failed");

        // Reduce holding tokens
        holdingTokens -= amount;

        emit TokensClaimed(msg.sender, amount);
    }

    // Owner can withdraw remaining ETH from the contract
    function withdrawETH() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }

    // Owner can withdraw remaining tokens, but must ensure there are enough tokens for the users to claim
    function withdrawTokens(uint256 _amount) external onlyOwner nonReentrant {
        uint256 availableBalance = token.balanceOf(address(this)); // Get available tokens in the contract
        require(_amount > 0, "Amount must be greater than zero");
        require(availableBalance - _amount >= holdingTokens, "Cannot withdraw tokens that are already purchased");

        // Transfer tokens to the owner
        require(token.transfer(owner(), _amount), "Token transfer failed");

        // Decrease the holding tokens count
        holdingTokens -= _amount;

        emit TokensWithdrawn(owner(), _amount);
    }

    // Fallback function to receive ETH in case of direct transfer
    receive() external payable {}
}
