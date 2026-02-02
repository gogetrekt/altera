// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * =============================================================
 * DUMMY TOKEN - FOR TESTNET DEVELOPMENT ONLY
 * =============================================================
 * This is NOT real ETH. This is a dummy ERC20 token used to
 * simulate WETH for Uniswap V3 testing on Sepolia.
 * DO NOT USE ON MAINNET. NO REAL VALUE.
 * =============================================================
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyETH is ERC20 {
    // Decimals: 18 (same as native ETH / WETH)
    uint8 private constant DECIMALS = 18;

    // Initial supply: 1,000,000 tokens (minted to deployer)
    // 1_000_000 * 10^18 = 1e24
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 10 ** DECIMALS;

    constructor() ERC20("Dummy Ether", "dETH") {
        // Mint entire initial supply to deployer (msg.sender)
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Returns the number of decimals (18).
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}