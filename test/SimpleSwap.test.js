const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap", function () {
  let dETH;
  let dUSDC;
  let swap;
  let owner;
  let alice;

  const RATE = 2953n;
  const MIN_RATE = 100n;
  const MAX_RATE = 10_000_000n;

  beforeEach(async function () {
    [owner, alice] = await ethers.getSigners();

    const DummyETH = await ethers.getContractFactory("DummyETH");
    dETH = await DummyETH.deploy();

    const DummyUSDC = await ethers.getContractFactory("DummyUSDC");
    dUSDC = await DummyUSDC.deploy();

    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    swap = await SimpleSwap.deploy(
      await dETH.getAddress(),
      await dUSDC.getAddress()
    );

    // Fund the swap contract (well within DummyUSDC 1B * 10^6 total supply)
    await dETH.transfer(await swap.getAddress(), ethers.parseEther("100000"));
    await dUSDC.transfer(await swap.getAddress(), 100_000_000n * 10n ** 6n); // 100M dUSDC

    // Give alice tokens
    await dETH.transfer(alice.address, ethers.parseEther("1000"));
    await dUSDC.transfer(alice.address, 10_000_000n * 10n ** 6n);

    // Alice approves swap
    await dETH.connect(alice).approve(await swap.getAddress(), ethers.MaxUint256);
    await dUSDC.connect(alice).approve(await swap.getAddress(), ethers.MaxUint256);
  });

  describe("deployment", function () {
    it("stores dETH address", async function () {
      expect(await swap.dETH()).to.equal(await dETH.getAddress());
    });

    it("stores dUSDC address", async function () {
      expect(await swap.dUSDC()).to.equal(await dUSDC.getAddress());
    });

    it("initializes rate to 2953", async function () {
      expect(await swap.rate()).to.equal(RATE);
    });

    it("exposes MIN_RATE and MAX_RATE", async function () {
      expect(await swap.MIN_RATE()).to.equal(MIN_RATE);
      expect(await swap.MAX_RATE()).to.equal(MAX_RATE);
    });
  });

  describe("swapETHForUSDC", function () {
    it("transfers dUSDC to caller at correct rate", async function () {
      const amountIn = ethers.parseEther("1"); // 1 dETH
      const expectedOut = (amountIn * RATE) / 10n ** 12n;
      const before = await dUSDC.balanceOf(alice.address);
      await swap.connect(alice).swapETHForUSDC(amountIn);
      const after = await dUSDC.balanceOf(alice.address);
      expect(after - before).to.equal(expectedOut);
    });

    it("emits Swapped event", async function () {
      const amountIn = ethers.parseEther("1");
      const expectedOut = (amountIn * RATE) / 10n ** 12n;
      await expect(swap.connect(alice).swapETHForUSDC(amountIn))
        .to.emit(swap, "Swapped")
        .withArgs(
          alice.address,
          await dETH.getAddress(),
          await dUSDC.getAddress(),
          amountIn,
          expectedOut
        );
    });

    it("reverts on zero input", async function () {
      await expect(
        swap.connect(alice).swapETHForUSDC(0n)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("reverts when contract has insufficient dUSDC", async function () {
      // Drain dUSDC from swap
      const balance = await dUSDC.balanceOf(await swap.getAddress());
      await swap.withdraw(await dUSDC.getAddress(), balance);
      await expect(
        swap.connect(alice).swapETHForUSDC(ethers.parseEther("1"))
      ).to.be.revertedWith("Insufficient dUSDC liquidity");
    });
  });

  describe("swapUSDCForETH", function () {
    it("transfers dETH to caller at correct rate", async function () {
      const amountIn = 2953n * 10n ** 6n; // 2953 dUSDC
      const expectedOut = (amountIn * 10n ** 12n) / RATE;
      const before = await dETH.balanceOf(alice.address);
      await swap.connect(alice).swapUSDCForETH(amountIn);
      const after = await dETH.balanceOf(alice.address);
      expect(after - before).to.equal(expectedOut);
    });

    it("reverts on zero input", async function () {
      await expect(
        swap.connect(alice).swapUSDCForETH(0n)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("reverts when contract has insufficient dETH", async function () {
      const balance = await dETH.balanceOf(await swap.getAddress());
      await swap.withdraw(await dETH.getAddress(), balance);
      await expect(
        swap.connect(alice).swapUSDCForETH(2953n * 10n ** 6n)
      ).to.be.revertedWith("Insufficient dETH liquidity");
    });
  });

  describe("setRate", function () {
    it("allows owner to set rate within bounds", async function () {
      await swap.setRate(3000n);
      expect(await swap.rate()).to.equal(3000n);
    });

    it("emits RateUpdated event", async function () {
      await expect(swap.setRate(3000n))
        .to.emit(swap, "RateUpdated")
        .withArgs(RATE, 3000n);
    });

    it("allows setting rate to MIN_RATE", async function () {
      await swap.setRate(MIN_RATE);
      expect(await swap.rate()).to.equal(MIN_RATE);
    });

    it("allows setting rate to MAX_RATE", async function () {
      await swap.setRate(MAX_RATE);
      expect(await swap.rate()).to.equal(MAX_RATE);
    });

    it("reverts when rate is below MIN_RATE", async function () {
      await expect(swap.setRate(MIN_RATE - 1n)).to.be.revertedWith(
        "Rate out of bounds"
      );
    });

    it("reverts when rate is zero", async function () {
      await expect(swap.setRate(0n)).to.be.revertedWith("Rate out of bounds");
    });

    it("reverts when rate exceeds MAX_RATE", async function () {
      await expect(swap.setRate(MAX_RATE + 1n)).to.be.revertedWith(
        "Rate out of bounds"
      );
    });

    it("reverts when non-owner calls setRate", async function () {
      await expect(
        swap.connect(alice).setRate(3000n)
      ).to.be.revertedWithCustomError(swap, "OwnableUnauthorizedAccount");
    });
  });

  describe("getReserves", function () {
    it("returns current contract balances", async function () {
      const [dETHReserve, dUSDCReserve] = await swap.getReserves();
      expect(dETHReserve).to.equal(await dETH.balanceOf(await swap.getAddress()));
      expect(dUSDCReserve).to.equal(await dUSDC.balanceOf(await swap.getAddress()));
    });
  });
});
