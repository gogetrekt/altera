const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoreStaking", function () {
  let coreToken;
  let dummyUSDC;
  let dummyETH;
  let staking;
  let owner;
  let alice;
  let bob;

  const USDC_DECIMALS = 6;
  const DETH_DECIMALS = 18;
  const USDC_POOL = 0n;
  const DETH_POOL = 1n;
  const MAX_REWARD_RATE = ethers.parseEther("1"); // 1e18

  // 1 CORE per second per staked token - well below cap
  const INITIAL_RATE = 1000n;

  async function deployAll() {
    [owner, alice, bob] = await ethers.getSigners();

    const CoreToken = await ethers.getContractFactory("CoreToken");
    coreToken = await CoreToken.deploy();

    const DummyUSDC = await ethers.getContractFactory("DummyUSDC");
    dummyUSDC = await DummyUSDC.deploy();

    const DummyETH = await ethers.getContractFactory("DummyETH");
    dummyETH = await DummyETH.deploy();

    const CoreStaking = await ethers.getContractFactory("CoreStaking");
    staking = await CoreStaking.deploy(
      await coreToken.getAddress(),
      await dummyUSDC.getAddress(),
      await dummyETH.getAddress(),
      INITIAL_RATE,
      INITIAL_RATE
    );

    // Fund staking contract with CORE rewards
    const fundAmount = ethers.parseEther("100000");
    await coreToken.mint(owner.address, fundAmount);
    await coreToken.approve(await staking.getAddress(), fundAmount);
    await staking.fundRewards(fundAmount);

    // Give alice some staking tokens
    const usdcAmount = 1000n * 10n ** BigInt(USDC_DECIMALS);
    const dethAmount = ethers.parseEther("10");
    await dummyUSDC.transfer(alice.address, usdcAmount);
    await dummyETH.transfer(alice.address, dethAmount);

    // Alice approves staking
    await dummyUSDC.connect(alice).approve(await staking.getAddress(), usdcAmount);
    await dummyETH.connect(alice).approve(await staking.getAddress(), dethAmount);
  }

  beforeEach(deployAll);

  describe("deployment", function () {
    it("stores CORE token address", async function () {
      expect(await staking.coreToken()).to.equal(await coreToken.getAddress());
    });

    it("exposes MAX_REWARD_RATE constant", async function () {
      expect(await staking.MAX_REWARD_RATE()).to.equal(MAX_REWARD_RATE);
    });

    it("reverts when constructor rate exceeds cap", async function () {
      const CoreStaking = await ethers.getContractFactory("CoreStaking");
      const overCap = MAX_REWARD_RATE + 1n;
      await expect(
        CoreStaking.deploy(
          await coreToken.getAddress(),
          await dummyUSDC.getAddress(),
          await dummyETH.getAddress(),
          overCap,
          INITIAL_RATE
        )
      ).to.be.revertedWith("USDC rate exceeds cap");
    });
  });

  describe("rewardReserve", function () {
    it("returns CORE balance of contract", async function () {
      const fundAmount = ethers.parseEther("100000");
      expect(await staking.rewardReserve()).to.equal(fundAmount);
    });
  });

  describe("setRewardRate", function () {
    it("allows owner to set rate within cap", async function () {
      const newRate = 5000n;
      await staking.setRewardRate(USDC_POOL, newRate);
      const pool = await staking.pools(USDC_POOL);
      expect(pool.rewardRate).to.equal(newRate);
    });

    it("allows setting rate to exactly MAX_REWARD_RATE", async function () {
      await staking.setRewardRate(USDC_POOL, MAX_REWARD_RATE);
      const pool = await staking.pools(USDC_POOL);
      expect(pool.rewardRate).to.equal(MAX_REWARD_RATE);
    });

    it("reverts when rate exceeds MAX_REWARD_RATE", async function () {
      await expect(
        staking.setRewardRate(USDC_POOL, MAX_REWARD_RATE + 1n)
      ).to.be.revertedWith("Rate exceeds max");
    });

    it("reverts when rate is set to an extremely large value", async function () {
      const extremeRate = ethers.MaxUint256;
      await expect(
        staking.setRewardRate(USDC_POOL, extremeRate)
      ).to.be.revertedWith("Rate exceeds max");
    });

    it("reverts when non-owner calls setRewardRate", async function () {
      await expect(
        staking.connect(alice).setRewardRate(USDC_POOL, 100n)
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });

    it("emits RewardRateUpdated event", async function () {
      await expect(staking.setRewardRate(USDC_POOL, 2000n))
        .to.emit(staking, "RewardRateUpdated")
        .withArgs(USDC_POOL, 2000n);
    });
  });

  describe("stake", function () {
    it("allows user to stake tokens", async function () {
      const amount = 100n * 10n ** BigInt(USDC_DECIMALS);
      await staking.connect(alice).stake(USDC_POOL, amount);
      const userInfo = await staking.userInfo(USDC_POOL, alice.address);
      expect(userInfo.amount).to.equal(amount);
    });

    it("reverts on zero amount", async function () {
      await expect(
        staking.connect(alice).stake(USDC_POOL, 0n)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("reverts on invalid pool", async function () {
      await expect(
        staking.connect(alice).stake(99n, 100n)
      ).to.be.revertedWith("Invalid pool ID");
    });
  });

  describe("unstake", function () {
    const stakeAmt = 100n * 10n ** BigInt(USDC_DECIMALS);

    beforeEach(async function () {
      await staking.connect(alice).stake(USDC_POOL, stakeAmt);
    });

    it("returns staked tokens to user", async function () {
      const before = await dummyUSDC.balanceOf(alice.address);
      await staking.connect(alice).unstake(USDC_POOL, stakeAmt);
      const after = await dummyUSDC.balanceOf(alice.address);
      expect(after - before).to.equal(stakeAmt);
    });

    it("reverts when unstaking more than staked", async function () {
      await expect(
        staking.connect(alice).unstake(USDC_POOL, stakeAmt + 1n)
      ).to.be.revertedWith("Insufficient staked balance");
    });
  });

  describe("emergencyWithdraw", function () {
    const stakeAmt = 100n * 10n ** BigInt(USDC_DECIMALS);

    it("returns staked tokens even with zero reward reserve", async function () {
      // Drain the reward reserve first via owner withdrawal (simulate empty reserve)
      await staking.connect(alice).stake(USDC_POOL, stakeAmt);
      const before = await dummyUSDC.balanceOf(alice.address);
      await staking.connect(alice).emergencyWithdraw(USDC_POOL);
      const after = await dummyUSDC.balanceOf(alice.address);
      expect(after - before).to.equal(stakeAmt);
    });

    it("reverts when user has no stake", async function () {
      await expect(
        staking.connect(alice).emergencyWithdraw(USDC_POOL)
      ).to.be.revertedWith("No staked balance");
    });
  });

  describe("partial reward reserve handling", function () {
    it("allows unstake when reward reserve is empty (stake returned, no reward)", async function () {
      // Deploy staking with NO initial funding
      const CoreStaking = await ethers.getContractFactory("CoreStaking");
      const emptyStaking = await CoreStaking.deploy(
        await coreToken.getAddress(),
        await dummyUSDC.getAddress(),
        await dummyETH.getAddress(),
        INITIAL_RATE,
        INITIAL_RATE
      );

      const amount = 100n * 10n ** BigInt(USDC_DECIMALS);
      await dummyUSDC.transfer(bob.address, amount);
      await dummyUSDC.connect(bob).approve(await emptyStaking.getAddress(), amount);
      await emptyStaking.connect(bob).stake(USDC_POOL, amount);

      // Advance time so rewards accrue
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      // Unstake should succeed even with zero reward reserve
      // Bob gets stake back, no revert
      const stakeBefore = await dummyUSDC.balanceOf(bob.address);
      await emptyStaking.connect(bob).unstake(USDC_POOL, amount);
      const stakeAfter = await dummyUSDC.balanceOf(bob.address);
      expect(stakeAfter - stakeBefore).to.equal(amount);
    });
  });
});
