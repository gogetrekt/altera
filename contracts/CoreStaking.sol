// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract CoreStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant PRECISION = 1e12;
    uint256 public constant USDC_POOL = 0;
    uint256 public constant DETH_POOL = 1;

    // Maximum reward rate per pool: 1e18 CORE-wei per second
    // At this rate with 1 token staked the contract would drain in ~31.7 years,
    // which is intentionally generous for a demo while blocking pathological values.
    uint256 public constant MAX_REWARD_RATE = 1e18;

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
    // Emitted when a reward payment is capped by available contract balance
    event PartialRewardPaid(address indexed user, uint256 indexed poolId, uint256 requested, uint256 paid);

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
        require(_usdcRewardRate <= MAX_REWARD_RATE, "USDC rate exceeds cap");
        require(_dethRewardRate <= MAX_REWARD_RATE, "dETH rate exceeds cap");

        coreToken = IERC20(_coreToken);

        pools[USDC_POOL].stakeToken = _usdcToken;
        pools[USDC_POOL].rewardRate = _usdcRewardRate;
        pools[USDC_POOL].lastRewardTime = block.timestamp;

        pools[DETH_POOL].stakeToken = _dethToken;
        pools[DETH_POOL].rewardRate = _dethRewardRate;
        pools[DETH_POOL].lastRewardTime = block.timestamp;
    }

    /**
     * @notice Returns available CORE reward reserve in this contract
     */
    function rewardReserve() external view returns (uint256) {
        return coreToken.balanceOf(address(this));
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
     * @dev Transfer up to `pending` CORE to `recipient`, capped by contract balance.
     *      Emits PartialRewardPaid when the contract cannot pay the full amount.
     *      Returns the amount actually transferred.
     */
    function _safeRewardTransfer(address recipient, uint256 pending, uint256 poolId) internal returns (uint256) {
        if (pending == 0) return 0;
        uint256 available = coreToken.balanceOf(address(this));
        uint256 toTransfer = pending > available ? available : pending;
        if (toTransfer == 0) return 0;
        if (toTransfer < pending) {
            emit PartialRewardPaid(recipient, poolId, pending, toTransfer);
        }
        coreToken.safeTransfer(recipient, toTransfer);
        return toTransfer;
    }

    /**
     * @notice Stake tokens in a pool
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

        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare) / PRECISION -
                user.rewardDebt;
            if (pending > 0) {
                uint256 paid = _safeRewardTransfer(msg.sender, pending, _poolId);
                if (paid > 0) emit Claim(msg.sender, _poolId, paid);
            }
        }

        IERC20(pool.stakeToken).safeTransferFrom(msg.sender, address(this), _amount);

        user.amount += _amount;
        pool.totalStaked += _amount;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;

        emit Stake(msg.sender, _poolId, _amount);
    }

    /**
     * @notice Unstake tokens and claim rewards
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

        uint256 pending = (user.amount * pool.accRewardPerShare) / PRECISION -
            user.rewardDebt;
        if (pending > 0) {
            uint256 paid = _safeRewardTransfer(msg.sender, pending, _poolId);
            if (paid > 0) emit Claim(msg.sender, _poolId, paid);
        }

        user.amount -= _amount;
        pool.totalStaked -= _amount;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;

        IERC20(pool.stakeToken).safeTransfer(msg.sender, _amount);

        emit Unstake(msg.sender, _poolId, _amount);
    }

    /**
     * @notice Claim pending CORE rewards
     */
    function claim(uint256 _poolId) external validPool(_poolId) nonReentrant {
        Pool storage pool = pools[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        updatePool(_poolId);

        uint256 pending = (user.amount * pool.accRewardPerShare) / PRECISION -
            user.rewardDebt;

        require(pending > 0, "No pending rewards");

        user.rewardDebt = (user.amount * pool.accRewardPerShare) / PRECISION;

        uint256 paid = _safeRewardTransfer(msg.sender, pending, _poolId);
        require(paid > 0, "No reward reserve available");
        emit Claim(msg.sender, _poolId, paid);
    }

    /**
     * @notice Emergency withdraw without rewards (always succeeds if stake exists)
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
     * @notice Set reward rate for a pool (owner only, capped at MAX_REWARD_RATE)
     * @dev Settles current rewards before changing rate. No timelock in this version --
     *      adding a full timelock is documented as a remaining risk.
     */
    function setRewardRate(uint256 _poolId, uint256 _newRate)
        external
        onlyOwner
        validPool(_poolId)
    {
        require(_newRate <= MAX_REWARD_RATE, "Rate exceeds max");
        updatePool(_poolId);
        pools[_poolId].rewardRate = _newRate;
        emit RewardRateUpdated(_poolId, _newRate);
    }

    /**
     * @notice Fund contract with CORE rewards (owner only)
     */
    function fundRewards(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be > 0");
        coreToken.safeTransferFrom(msg.sender, address(this), _amount);
        emit RewardsFunded(_amount);
    }

    /**
     * @notice Get pool information
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
