// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleSwap
 * @notice A simple swap contract for dETH <-> dUSDC at a fixed rate
 * @dev Deploy this, fund with both tokens, users can swap freely
 */
contract SimpleSwap is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable dETH;
    IERC20 public immutable dUSDC;
    
    // Rate: 1 dETH = 2953 dUSDC (can be updated by owner)
    uint256 public rate = 2953;
    
    event Swapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event RateUpdated(uint256 oldRate, uint256 newRate);

    constructor(address _dETH, address _dUSDC) Ownable(msg.sender) {
        dETH = IERC20(_dETH);
        dUSDC = IERC20(_dUSDC);
    }

    /**
     * @notice Swap dETH for dUSDC
     * @param amountIn Amount of dETH to swap
     */
    function swapETHForUSDC(uint256 amountIn) external {
        require(amountIn > 0, "Amount must be > 0");
        
        // Calculate output: dETH (18 decimals) -> dUSDC (6 decimals)
        // amountOut = amountIn * rate / 10^12
        uint256 amountOut = (amountIn * rate) / 1e12;
        
        require(dUSDC.balanceOf(address(this)) >= amountOut, "Insufficient dUSDC liquidity");
        
        // Transfer dETH from user to contract
        dETH.safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Transfer dUSDC to user
        dUSDC.safeTransfer(msg.sender, amountOut);
        
        emit Swapped(msg.sender, address(dETH), address(dUSDC), amountIn, amountOut);
    }

    /**
     * @notice Swap dUSDC for dETH
     * @param amountIn Amount of dUSDC to swap
     */
    function swapUSDCForETH(uint256 amountIn) external {
        require(amountIn > 0, "Amount must be > 0");
        
        // Calculate output: dUSDC (6 decimals) -> dETH (18 decimals)
        // amountOut = amountIn * 10^12 / rate
        uint256 amountOut = (amountIn * 1e12) / rate;
        
        require(dETH.balanceOf(address(this)) >= amountOut, "Insufficient dETH liquidity");
        
        // Transfer dUSDC from user to contract
        dUSDC.safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Transfer dETH to user
        dETH.safeTransfer(msg.sender, amountOut);
        
        emit Swapped(msg.sender, address(dUSDC), address(dETH), amountIn, amountOut);
    }

    /**
     * @notice Update the swap rate (only owner)
     * @param newRate New rate (1 dETH = newRate dUSDC)
     */
    function setRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be > 0");
        uint256 oldRate = rate;
        rate = newRate;
        emit RateUpdated(oldRate, newRate);
    }

    /**
     * @notice Withdraw tokens (only owner)
     */
    function withdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice Get reserves
     */
    function getReserves() external view returns (uint256 dETHReserve, uint256 dUSDCReserve) {
        dETHReserve = dETH.balanceOf(address(this));
        dUSDCReserve = dUSDC.balanceOf(address(this));
    }
}
