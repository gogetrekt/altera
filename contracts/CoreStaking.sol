// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract CoreStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant PRECISION = 1e12;
    uint256 public constant USDC_POOL = 0;
    uint256 public constant DETH_POOL = 1;

    struct Pool {
        address stakeToken;
        uint256 totalStaked;
        uint256 rewardRate;
        uint256 accRewardPerShare;
        uint256 lastRewardTime;
    }

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    IERC20 public coreToken;
    Pool[2] public pools;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    event Stake(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstake(address indexed user, uint256 indexed poolId, uint256 amount);
    event Claim(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardRateUpdated(uint256 indexed poolId, uint256 newRate);
    event RewardsFunded(uint256 amount);

    modifier validPool(uint256 _poolId) {
        require(_poolId == USDC_POOL || _poolId == DETH_POOL, "Invalid pool ID");
        _;
    }

    constructor(
        address _coreToken,
        address _usdcToken,
        address _dethToken,
        uint256 _usdcRewardRate,
        uint256 _dethRewardRate
    ) Ownable(msg.sender) {
        require(_coreToken != address(0), "Invalid CORE token");
        require(_usdcToken != address(0), "Invalid USDC token");
        require(_dethToken != address(0), "Invalid dETH token");

        coreToken = IERC20(_coreToken);

        // Initialize USDC pool (Pool 0)
        pools[USDC_POOL].stakeToken = _usdcToken;
        pools[USDC_POOL].rewardRate = _usdcRewardRate;
        pools[USDC_POOL].lastRewardTime = block.timestamp;

        // Initialize dETH pool (Pool 1)
        pools[DETH_POOL].stakeToken = _dethToken;
        pools[DETH_POOL].rewardRate = _dethRewardRate;
        pools[DETH_POOL].lastRewardTime = block.timestamp;
    }

    /**
     * @notice Update pool's accRewardPerShare
     */
    function updatePool(uint256 _poolId) internal validPool(_poolId) {
        Pool storage pool = pools[_poolId];

        if (block.timestamp <= pool.lastRewardTime) {
            return;
        }

        if (pool.totalStaked == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }

        uint256 timeDiff = block.timestamp - pool.lastRewardTime;
        uint256 reward = timeDiff * pool.rewardRate;
        pool.accRewardPerShare += (reward * PRECISION) / pool.totalStaked;
        pool.lastRewardTime = block.timestamp;
    }

    /**
     * @notice Stake tokens in a pool
     * @param _poolId Pool ID (0 = USDC, 1 = dETH)
     * @param _amount Amount to stake
     */
    function stake(uint256 _poolId, uint256 _amount)
        external
        validPool(_poolId)
        nonReentrant
    {
        require(_amount > 0, "Amount must be > 0");

        Pool storage pool = pools[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        updatePool(_poolId);

        // Harvest existing rewards
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare) / PRECISION -
                user.rewardDebt;
            if (pending > 0) {
                coreToken.safeTransfer(msg.sender, pending);
                emit Claim(msg.sender, _poolId, pending);
            }
        }

        // Transfer stake token from user to contract
        IERC20(pool.stakeToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        // Update user and pool
        user.amount += _amount;
        pool.totalStaked += _amount;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;

        emit Stake(msg.sender, _poolId, _amount);
    }

    /**
     * @notice Unstake tokens and claim rewards
     * @param _poolId Pool ID (0 = USDC, 1 = dETH)
     * @param _amount Amount to unstake
     */
    function unstake(uint256 _poolId, uint256 _amount)
        external
        validPool(_poolId)
        nonReentrant
    {
        require(_amount > 0, "Amount must be > 0");

        Pool storage pool = pools[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        require(user.amount >= _amount, "Insufficient staked balance");

        updatePool(_poolId);

        // Harvest rewards
        uint256 pending = (user.amount * pool.accRewardPerShare) / PRECISION -
            user.rewardDebt;
        if (pending > 0) {
            coreToken.safeTransfer(msg.sender, pending);
            emit Claim(msg.sender, _poolId, pending);
        }

        // Update user and pool
        user.amount -= _amount;
        pool.totalStaked -= _amount;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;

        // Transfer stake token back to user
        IERC20(pool.stakeToken).safeTransfer(msg.sender, _amount);

        emit Unstake(msg.sender, _poolId, _amount);
    }

    /**
     * @notice Claim pending CORE rewards
     * @param _poolId Pool ID (0 = USDC, 1 = dETH)
     */
    function claim(uint256 _poolId) external validPool(_poolId) nonReentrant {
        Pool storage pool = pools[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        updatePool(_poolId);

        uint256 pending = (user.amount * pool.accRewardPerShare) / PRECISION -
            user.rewardDebt;

        require(pending > 0, "No pending rewards");

        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;

        coreToken.safeTransfer(msg.sender, pending);

        emit Claim(msg.sender, _poolId, pending);
    }

    /**
     * @notice Emergency withdraw without rewards
     * @param _poolId Pool ID (0 = USDC, 1 = dETH)
     */
    function emergencyWithdraw(uint256 _poolId)
        external
        validPool(_poolId)
        nonReentrant
    {
        Pool storage pool = pools[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        uint256 amount = user.amount;
        require(amount > 0, "No staked balance");

        pool.totalStaked -= amount;
        user.amount = 0;
        user.rewardDebt = 0;

        IERC20(pool.stakeToken).safeTransfer(msg.sender, amount);

        emit Unstake(msg.sender, _poolId, amount);
    }

    /**
     * @notice Get pending rewards for a user
     * @param _user User address
     * @param _poolId Pool ID (0 = USDC, 1 = dETH)
     */
    function pendingReward(address _user, uint256 _poolId)
        external
        view
        validPool(_poolId)
        returns (uint256)
    {
        Pool storage pool = pools[_poolId];
        UserInfo storage user = userInfo[_poolId][_user];

        uint256 accRewardPerShare = pool.accRewardPerShare;

        if (block.timestamp > pool.lastRewardTime && pool.totalStaked > 0) {
            uint256 timeDiff = block.timestamp - pool.lastRewardTime;
            uint256 reward = timeDiff * pool.rewardRate;
            accRewardPerShare += (reward * PRECISION) / pool.totalStaked;
        }

        return (user.amount * accRewardPerShare) / PRECISION - user.rewardDebt;
    }

    /**
     * @notice Set reward rate for a pool (owner only)
     * @param _poolId Pool ID (0 = USDC, 1 = dETH)
     * @param _newRate New reward rate (CORE per second)
     */
    function setRewardRate(uint256 _poolId, uint256 _newRate)
        external
        onlyOwner
        validPool(_poolId)
    {
        updatePool(_poolId);
        pools[_poolId].rewardRate = _newRate;
        emit RewardRateUpdated(_poolId, _newRate);
    }

    /**
     * @notice Fund contract with CORE rewards (owner only)
     * @param _amount Amount of CORE to fund
     */
    function fundRewards(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be > 0");
        coreToken.safeTransferFrom(msg.sender, address(this), _amount);
        emit RewardsFunded(_amount);
    }

    /**
     * @notice Get pool information
     * @param _poolId Pool ID (0 = USDC, 1 = dETH)
     */
    function getPool(uint256 _poolId)
        external
        view
        validPool(_poolId)
        returns (Pool memory)
    {
        return pools[_poolId];
    }

    /**
     * @notice Get user information in a pool
     * @param _poolId Pool ID (0 = USDC, 1 = dETH)
     * @param _user User address
     */
    function getUserInfo(uint256 _poolId, address _user)
        external
        view
        validPool(_poolId)
        returns (UserInfo memory)
    {
        return userInfo[_poolId][_user];
    }
}