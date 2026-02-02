// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenFaucet
 * @notice Distributes existing ERC20 tokens to users with a cooldown mechanism
 * @dev This is a testnet faucet. It does NOT mint tokens, only transfers pre-funded tokens.
 */
contract TokenFaucet is Ownable {
    // ==================== STATE VARIABLES ====================

    IERC20 public token;
    uint256 public faucetAmount;
    uint256 public cooldown;

    mapping(address => uint256) public lastClaim;

    // ==================== EVENTS ====================

    event Claimed(address indexed user, uint256 amount);
    event FaucetAmountUpdated(uint256 newAmount);
    event CooldownUpdated(uint256 newCooldown);

    // ==================== CONSTRUCTOR ====================

    /**
     * @notice Initialize the token faucet
     * @param _token Address of the ERC20 token to distribute
     * @param _faucetAmount Amount of tokens sent per claim
     * @param _cooldown Cooldown period in seconds between claims
     */
    constructor(
        address _token,
        uint256 _faucetAmount,
        uint256 _cooldown
    )
        Ownable(msg.sender)
    {
        require(_token != address(0), "Invalid token address");
        require(_faucetAmount > 0, "Faucet amount must be greater than 0");

        token = IERC20(_token);
        faucetAmount = _faucetAmount;
        cooldown = _cooldown;
    }

    // ==================== PUBLIC FUNCTIONS ====================

    /**
     * @notice Claim tokens from the faucet
     * @dev User must wait cooldown period since last claim
     */
    function claim() external {
        require(
            block.timestamp >= lastClaim[msg.sender] + cooldown,
            "Cooldown not expired"
        );

        lastClaim[msg.sender] = block.timestamp;

        require(
            token.transfer(msg.sender, faucetAmount),
            "Token transfer failed"
        );

        emit Claimed(msg.sender, faucetAmount);
    }

    /**
     * @notice Set new faucet amount (owner only)
     * @param amount New amount of tokens to distribute per claim
     */
    function setFaucetAmount(uint256 amount) external onlyOwner {
        require(amount > 0, "Faucet amount must be greater than 0");
        faucetAmount = amount;
        emit FaucetAmountUpdated(amount);
    }

    /**
     * @notice Set new cooldown period (owner only)
     * @param newCooldown New cooldown time in seconds
     */
    function setCooldown(uint256 newCooldown) external onlyOwner {
        cooldown = newCooldown;
        emit CooldownUpdated(newCooldown);
    }

    /**
     * @notice Get remaining cooldown time for a user
     * @param user Address of the user
     * @return Seconds remaining until next claim is available (0 if ready)
     */
    function getRemainingCooldown(address user) external view returns (uint256) {
        uint256 nextClaimTime = lastClaim[user] + cooldown;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }

    /**
     * @notice Emergency withdrawal of remaining tokens (owner only)
     * @param amount Amount of tokens to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(
            token.transfer(msg.sender, amount),
            "Withdrawal failed"
        );
    }
}
