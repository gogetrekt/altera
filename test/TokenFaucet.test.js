const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFaucet", function () {
  let token;
  let faucet;
  let owner;
  let alice;
  let bob;

  const FAUCET_AMOUNT = ethers.parseEther("10");
  const COOLDOWN = 86400n; // 24 hours in seconds

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const DummyETH = await ethers.getContractFactory("DummyETH");
    token = await DummyETH.deploy();

    const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await TokenFaucet.deploy(
      await token.getAddress(),
      FAUCET_AMOUNT,
      COOLDOWN
    );

    // Fund the faucet
    await token.transfer(await faucet.getAddress(), ethers.parseEther("10000"));
  });

  describe("deployment", function () {
    it("stores token address", async function () {
      expect(await faucet.token()).to.equal(await token.getAddress());
    });

    it("stores faucet amount", async function () {
      expect(await faucet.faucetAmount()).to.equal(FAUCET_AMOUNT);
    });

    it("stores cooldown", async function () {
      expect(await faucet.cooldown()).to.equal(COOLDOWN);
    });

    it("reverts with zero address token", async function () {
      const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
      await expect(
        TokenFaucet.deploy(ethers.ZeroAddress, FAUCET_AMOUNT, COOLDOWN)
      ).to.be.revertedWith("Invalid token address");
    });
  });

  describe("claim", function () {
    it("transfers faucetAmount to caller", async function () {
      const before = await token.balanceOf(alice.address);
      await faucet.connect(alice).claim();
      const after = await token.balanceOf(alice.address);
      expect(after - before).to.equal(FAUCET_AMOUNT);
    });

    it("emits Claimed event", async function () {
      await expect(faucet.connect(alice).claim())
        .to.emit(faucet, "Claimed")
        .withArgs(alice.address, FAUCET_AMOUNT);
    });

    it("records lastClaim timestamp", async function () {
      const tx = await faucet.connect(alice).claim();
      const block = await ethers.provider.getBlock(tx.blockNumber);
      expect(await faucet.lastClaim(alice.address)).to.equal(block.timestamp);
    });

    it("reverts on second claim before cooldown expires", async function () {
      await faucet.connect(alice).claim();
      await expect(faucet.connect(alice).claim()).to.be.revertedWith(
        "Cooldown not expired"
      );
    });

    it("allows claim after cooldown expires", async function () {
      await faucet.connect(alice).claim();
      await ethers.provider.send("evm_increaseTime", [Number(COOLDOWN)]);
      await ethers.provider.send("evm_mine");
      await expect(faucet.connect(alice).claim()).to.not.be.reverted;
    });

    it("two different users can claim independently", async function () {
      await faucet.connect(alice).claim();
      await faucet.connect(bob).claim();
      expect(await token.balanceOf(alice.address)).to.equal(FAUCET_AMOUNT);
      expect(await token.balanceOf(bob.address)).to.equal(FAUCET_AMOUNT);
    });
  });

  describe("getRemainingCooldown", function () {
    it("returns zero before first claim", async function () {
      expect(await faucet.getRemainingCooldown(alice.address)).to.equal(0n);
    });

    it("returns positive value immediately after claim", async function () {
      await faucet.connect(alice).claim();
      const remaining = await faucet.getRemainingCooldown(alice.address);
      expect(remaining).to.be.gt(0n);
    });

    it("returns zero after cooldown expires", async function () {
      await faucet.connect(alice).claim();
      await ethers.provider.send("evm_increaseTime", [Number(COOLDOWN) + 1]);
      await ethers.provider.send("evm_mine");
      expect(await faucet.getRemainingCooldown(alice.address)).to.equal(0n);
    });
  });

  describe("emergencyWithdraw", function () {
    it("allows owner to withdraw tokens", async function () {
      const amount = ethers.parseEther("100");
      const before = await token.balanceOf(owner.address);
      await faucet.emergencyWithdraw(amount);
      const after = await token.balanceOf(owner.address);
      expect(after - before).to.equal(amount);
    });

    it("reverts when non-owner calls emergencyWithdraw", async function () {
      await expect(
        faucet.connect(alice).emergencyWithdraw(ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(faucet, "OwnableUnauthorizedAccount");
    });
  });

  describe("setCooldown", function () {
    it("allows owner to change cooldown", async function () {
      const newCooldown = 3600n;
      await faucet.setCooldown(newCooldown);
      expect(await faucet.cooldown()).to.equal(newCooldown);
    });

    it("emits CooldownUpdated event", async function () {
      await expect(faucet.setCooldown(3600n))
        .to.emit(faucet, "CooldownUpdated")
        .withArgs(3600n);
    });

    it("reverts when non-owner calls setCooldown", async function () {
      await expect(
        faucet.connect(alice).setCooldown(3600n)
      ).to.be.revertedWithCustomError(faucet, "OwnableUnauthorizedAccount");
    });
  });
});
