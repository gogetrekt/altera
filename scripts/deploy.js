const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const dETH = "0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9";
  const dUSDC = "0xecefA4372C0cb1D103527d6350d10E1556657292";

  console.log("🚀 Deploying SimpleSwap to Sepolia...\n");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  console.log("Deployer:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  // Read compiled artifact
  const artifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/SimpleSwap.sol/SimpleSwap.json", "utf8")
  );

  // Create contract factory
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  // Deploy
  console.log("Deploying with params:");
  console.log("  dETH:", dETH);
  console.log("  dUSDC:", dUSDC);

  const contract = await factory.deploy(dETH, dUSDC);
  console.log("\n⏳ Waiting for deployment...");
  console.log("Tx hash:", contract.deploymentTransaction().hash);

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ SimpleSwap deployed to:", address);

  // Update config file
  const configPath = "./lib/uniswap-config.ts";
  let config = fs.readFileSync(configPath, "utf8");
  config = config.replace(
    /export const SIMPLE_SWAP_ADDRESS = '0x[a-fA-F0-9]*'/,
    `export const SIMPLE_SWAP_ADDRESS = '${address}'`
  );
  fs.writeFileSync(configPath, config);
  console.log("\n📝 Updated lib/uniswap-config.ts with new address");

  console.log("\n📋 Next steps:");
  console.log("1. Fund the contract with dETH and dUSDC");
  console.log("   - Send dETH to:", address);
  console.log("   - Send dUSDC to:", address);
  console.log("2. Test swap on your frontend!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
