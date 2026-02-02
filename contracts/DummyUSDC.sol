// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * =============================================================
 * DUMMY TOKEN - FOR TESTNET DEVELOPMENT ONLY
 * =============================================================
 * This is NOT real USDC. This is a dummy ERC20 token used to
 * simulate USDC for Uniswap V3 testing on Sepolia.
 * DO NOT USE ON MAINNET. NO REAL VALUE.
 * =============================================================
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyUSDC is ERC20 {
    // Decimals: 6 (same as real USDC)
    uint8 private constant DECIMALS = 6;

    // Initial supply: 1,000,000,000 tokens (minted to deployer)
    // 1_000_000_000 * 10^6 = 1e15
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000 * 10 ** DECIMALS;

    constructor() ERC20("Dummy USD Coin", "dUSDC") {
        // Mint entire initial supply to deployer (msg.sender)
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Returns the number of decimals (6).
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}