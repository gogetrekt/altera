// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleLiquidity
 * @notice Simple AMM liquidity pool for dETH <-> dUSDC
 * @dev Users can add/remove liquidity and earn LP tokens
 */
contract SimpleLiquidity is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable dETH;
    IERC20 public immutable dUSDC;
    
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    
    // Fee: 0.3% (30 basis points)
    uint256 public constant FEE_NUMERATOR = 3;
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    event LiquidityAdded(
        address indexed provider,
        uint256 dETHAmount,
        uint256 dUSDCAmount,
        uint256 lpTokens
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 dETHAmount,
        uint256 dUSDCAmount,
        uint256 lpTokens
    );
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(address _dETH, address _dUSDC) 
        ERC20("SimpleLP dETH-dUSDC", "SLP-ETH-USDC") 
        Ownable(msg.sender) 
    {
        dETH = IERC20(_dETH);
        dUSDC = IERC20(_dUSDC);
    }

    /**
     * @notice Add liquidity to the pool
     * @param dETHAmount Amount of dETH to add
     * @param dUSDCAmount Amount of dUSDC to add
     * @param minLPTokens Minimum LP tokens to receive (slippage protection)
     * @return lpTokens Amount of LP tokens minted
     */
    function addLiquidity(
        uint256 dETHAmount,
        uint256 dUSDCAmount,
        uint256 minLPTokens
    ) external nonReentrant returns (uint256 lpTokens) {
        require(dETHAmount > 0 && dUSDCAmount > 0, "Amounts must be > 0");
        
        uint256 dETHReserve = dETH.balanceOf(address(this));
        uint256 dUSDCReserve = dUSDC.balanceOf(address(this));
        uint256 totalSupply_ = totalSupply();
        
        if (totalSupply_ == 0) {
            // First liquidity provider
            // LP tokens = sqrt(dETHAmount * dUSDCAmount) adjusted for decimals
            // dETH has 18 decimals, dUSDC has 6 decimals
            // We use geometric mean adjusted for decimals
            lpTokens = sqrt(dETHAmount * dUSDCAmount);
            require(lpTokens > MINIMUM_LIQUIDITY, "Insufficient initial liquidity");
            
            // Lock minimum liquidity forever (prevent division by zero attacks)
            _mint(address(1), MINIMUM_LIQUIDITY);
            lpTokens -= MINIMUM_LIQUIDITY;
        } else {
            // Calculate LP tokens based on proportional contribution
            uint256 lpFromETH = (dETHAmount * totalSupply_) / dETHReserve;
            uint256 lpFromUSDC = (dUSDCAmount * totalSupply_) / dUSDCReserve;
            
            // Take the minimum to maintain ratio
            lpTokens = lpFromETH < lpFromUSDC ? lpFromETH : lpFromUSDC;
        }
        
        require(lpTokens >= minLPTokens, "Slippage: insufficient LP tokens");
        
        // Transfer tokens from user
        dETH.safeTransferFrom(msg.sender, address(this), dETHAmount);
        dUSDC.safeTransferFrom(msg.sender, address(this), dUSDCAmount);
        
        // Mint LP tokens
        _mint(msg.sender, lpTokens);
        
        emit LiquidityAdded(msg.sender, dETHAmount, dUSDCAmount, lpTokens);
    }

    /**
     * @notice Remove liquidity from the pool
     * @param lpTokens Amount of LP tokens to burn
     * @param minDETH Minimum dETH to receive
     * @param minDUSDC Minimum dUSDC to receive
     * @return dETHAmount Amount of dETH returned
     * @return dUSDCAmount Amount of dUSDC returned
     */
    function removeLiquidity(
        uint256 lpTokens,
        uint256 minDETH,
        uint256 minDUSDC
    ) external nonReentrant returns (uint256 dETHAmount, uint256 dUSDCAmount) {
        require(lpTokens > 0, "LP tokens must be > 0");
        require(balanceOf(msg.sender) >= lpTokens, "Insufficient LP tokens");
        
        uint256 totalSupply_ = totalSupply();
        uint256 dETHReserve = dETH.balanceOf(address(this));
        uint256 dUSDCReserve = dUSDC.balanceOf(address(this));
        
        // Calculate proportional amounts
        dETHAmount = (lpTokens * dETHReserve) / totalSupply_;
        dUSDCAmount = (lpTokens * dUSDCReserve) / totalSupply_;
        
        require(dETHAmount >= minDETH, "Slippage: insufficient dETH");
        require(dUSDCAmount >= minDUSDC, "Slippage: insufficient dUSDC");
        
        // Burn LP tokens
        _burn(msg.sender, lpTokens);
        
        // Transfer tokens to user
        dETH.safeTransfer(msg.sender, dETHAmount);
        dUSDC.safeTransfer(msg.sender, dUSDCAmount);
        
        emit LiquidityRemoved(msg.sender, dETHAmount, dUSDCAmount, lpTokens);
    }

    /**
     * @notice Swap dETH for dUSDC
     * @param amountIn Amount of dETH to swap
     * @param minAmountOut Minimum dUSDC to receive
     * @return amountOut Amount of dUSDC received
     */
    function swapETHForUSDC(uint256 amountIn, uint256 minAmountOut) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be > 0");
        
        uint256 dETHReserve = dETH.balanceOf(address(this));
        uint256 dUSDCReserve = dUSDC.balanceOf(address(this));
        
        // Calculate output with fee (x * y = k formula)
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        amountOut = (amountInWithFee * dUSDCReserve) / (dETHReserve * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut >= minAmountOut, "Slippage: insufficient output");
        require(amountOut <= dUSDCReserve, "Insufficient liquidity");
        
        dETH.safeTransferFrom(msg.sender, address(this), amountIn);
        dUSDC.safeTransfer(msg.sender, amountOut);
        
        emit Swap(msg.sender, address(dETH), address(dUSDC), amountIn, amountOut);
    }

    /**
     * @notice Swap dUSDC for dETH
     * @param amountIn Amount of dUSDC to swap
     * @param minAmountOut Minimum dETH to receive
     * @return amountOut Amount of dETH received
     */
    function swapUSDCForETH(uint256 amountIn, uint256 minAmountOut) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be > 0");
        
        uint256 dETHReserve = dETH.balanceOf(address(this));
        uint256 dUSDCReserve = dUSDC.balanceOf(address(this));
        
        // Calculate output with fee (x * y = k formula)
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        amountOut = (amountInWithFee * dETHReserve) / (dUSDCReserve * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut >= minAmountOut, "Slippage: insufficient output");
        require(amountOut <= dETHReserve, "Insufficient liquidity");
        
        dUSDC.safeTransferFrom(msg.sender, address(this), amountIn);
        dETH.safeTransfer(msg.sender, amountOut);
        
        emit Swap(msg.sender, address(dUSDC), address(dETH), amountIn, amountOut);
    }

    /**
     * @notice Get current reserves
     */
    function getReserves() external view returns (uint256 dETHReserve, uint256 dUSDCReserve) {
        dETHReserve = dETH.balanceOf(address(this));
        dUSDCReserve = dUSDC.balanceOf(address(this));
    }

    /**
     * @notice Get current price (dUSDC per dETH)
     */
    function getPrice() external view returns (uint256) {
        uint256 dETHReserve = dETH.balanceOf(address(this));
        uint256 dUSDCReserve = dUSDC.balanceOf(address(this));
        if (dETHReserve == 0) return 0;
        // Return price with 6 decimal precision (dUSDC has 6 decimals)
        // Price = dUSDCReserve * 10^18 / dETHReserve (gives dUSDC per 1 dETH in 6 decimals)
        return (dUSDCReserve * 1e18) / dETHReserve;
    }

    /**
     * @notice Calculate expected LP tokens for given amounts
     */
    function calculateLPTokens(uint256 dETHAmount, uint256 dUSDCAmount) external view returns (uint256) {
        uint256 totalSupply_ = totalSupply();
        if (totalSupply_ == 0) {
            return sqrt(dETHAmount * dUSDCAmount) - MINIMUM_LIQUIDITY;
        }
        
        uint256 dETHReserve = dETH.balanceOf(address(this));
        uint256 dUSDCReserve = dUSDC.balanceOf(address(this));
        
        uint256 lpFromETH = (dETHAmount * totalSupply_) / dETHReserve;
        uint256 lpFromUSDC = (dUSDCAmount * totalSupply_) / dUSDCReserve;
        
        return lpFromETH < lpFromUSDC ? lpFromETH : lpFromUSDC;
    }

    /**
     * @notice Calculate tokens returned for LP amount
     */
    function calculateRemoveAmounts(uint256 lpTokens) external view returns (uint256 dETHAmount, uint256 dUSDCAmount) {
        uint256 totalSupply_ = totalSupply();
        if (totalSupply_ == 0) return (0, 0);
        
        uint256 dETHReserve = dETH.balanceOf(address(this));
        uint256 dUSDCReserve = dUSDC.balanceOf(address(this));
        
        dETHAmount = (lpTokens * dETHReserve) / totalSupply_;
        dUSDCAmount = (lpTokens * dUSDCReserve) / totalSupply_;
    }

    /**
     * @notice Get user's share of the pool
     */
    function getUserShare(address user) external view returns (uint256 sharePercent, uint256 dETHShare, uint256 dUSDCShare) {
        uint256 userBalance = balanceOf(user);
        uint256 totalSupply_ = totalSupply();
        
        if (totalSupply_ == 0 || userBalance == 0) return (0, 0, 0);
        
        uint256 dETHReserve = dETH.balanceOf(address(this));
        uint256 dUSDCReserve = dUSDC.balanceOf(address(this));
        
        sharePercent = (userBalance * 10000) / totalSupply_; // basis points
        dETHShare = (userBalance * dETHReserve) / totalSupply_;
        dUSDCShare = (userBalance * dUSDCReserve) / totalSupply_;
    }

    /**
     * @notice Babylonian square root
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /**
     * @notice Emergency withdraw (only owner)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
