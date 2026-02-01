const hre = require("hardhat");

async function main() {
  const dETH = "0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9";
  const dUSDC = "0xecefA4372C0cb1D103527d6350d10E1556657292";

  console.log("Deploying SimpleSwap...");
  console.log("dETH:", dETH);
  console.log("dUSDC:", dUSDC);

  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwap.deploy(dETH, dUSDC);

  await simpleSwap.waitForDeployment();

  const address = await simpleSwap.getAddress();
  console.log("\n✅ SimpleSwap deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Update SIMPLE_SWAP_ADDRESS in lib/uniswap-config.ts");
  console.log("2. Fund the contract with dETH and dUSDC");
  console.log("3. Users can now swap!");

  // Verify on Etherscan (optional)
  console.log("\n🔍 To verify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${address} ${dETH} ${dUSDC}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
