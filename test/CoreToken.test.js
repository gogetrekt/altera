const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoreToken", function () {
  let coreToken;
  let owner;
  let user;

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M
  const MAX_SUPPLY = ethers.parseEther("10000000");    // 10M

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const CoreToken = await ethers.getContractFactory("CoreToken");
    coreToken = await CoreToken.deploy();
  });

  describe("deployment", function () {
    it("mints initial supply to deployer", async function () {
      expect(await coreToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("sets total supply to initial supply", async function () {
      expect(await coreToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("exposes MAX_SUPPLY constant", async function () {
      expect(await coreToken.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });
  });

  describe("mint", function () {
    it("allows owner to mint within cap", async function () {
      const mintAmount = ethers.parseEther("100");
      await coreToken.mint(user.address, mintAmount);
      expect(await coreToken.balanceOf(user.address)).to.equal(mintAmount);
    });

    it("reverts when non-owner calls mint", async function () {
      await expect(
        coreToken.connect(user).mint(user.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(coreToken, "OwnableUnauthorizedAccount");
    });

    it("reverts when minting to zero address", async function () {
      await expect(
        coreToken.mint(ethers.ZeroAddress, ethers.parseEther("1"))
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("reverts when amount is zero", async function () {
      await expect(
        coreToken.mint(user.address, 0n)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("reverts when minting would exceed MAX_SUPPLY", async function () {
      // Already 1M minted. Attempting to mint 9M+1 should fail.
      const overCap = MAX_SUPPLY - INITIAL_SUPPLY + 1n;
      await expect(
        coreToken.mint(user.address, overCap)
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("allows minting up to exactly MAX_SUPPLY", async function () {
      const remaining = MAX_SUPPLY - INITIAL_SUPPLY;
      await coreToken.mint(user.address, remaining);
      expect(await coreToken.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("reverts when minting one token above MAX_SUPPLY in two steps", async function () {
      const remaining = MAX_SUPPLY - INITIAL_SUPPLY;
      await coreToken.mint(user.address, remaining);
      await expect(
        coreToken.mint(user.address, 1n)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });
});
