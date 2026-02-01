const { ethers } = require("ethers");
require("dotenv").config({ path: ".env.local" });

const SIMPLE_SWAP = "0x52384F0fA5E28c3948C50f94Ed129cb130b98167";
const DETH_FAUCET = "0xc0fc9dDA05803CA29e0eB44c104D17eC717435c8";
const DUSDC_FAUCET = "0x661A3e297a23Be077F6b3a3C5764773da4F3400e";
const DETH = "0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9";
const DUSDC = "0xecefA4372C0cb1D103527d6350d10E1556657292";

const FAUCET_ABI = [
  "function claim() external",
  "function claimAmount() view returns (uint256)"
];

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  console.log("💰 Funding SimpleSwap contract...\n");
  console.log("Wallet:", wallet.address);
  console.log("SimpleSwap:", SIMPLE_SWAP, "\n");

  const dethFaucet = new ethers.Contract(DETH_FAUCET, FAUCET_ABI, wallet);
  const dusdcFaucet = new ethers.Contract(DUSDC_FAUCET, FAUCET_ABI, wallet);
  const deth = new ethers.Contract(DETH, ERC20_ABI, wallet);
  const dusdc = new ethers.Contract(DUSDC, ERC20_ABI, wallet);

  // Step 1: Claim from faucets
  console.log("📥 Claiming from dETH faucet...");
  try {
    const tx1 = await dethFaucet.claim();
    await tx1.wait();
    console.log("✅ Claimed dETH");
  } catch (e) {
    console.log("⚠️  dETH claim failed (maybe cooldown):", e.message?.slice(0, 50));
  }

  console.log("📥 Claiming from dUSDC faucet...");
  try {
    const tx2 = await dusdcFaucet.claim();
    await tx2.wait();
    console.log("✅ Claimed dUSDC");
  } catch (e) {
    console.log("⚠️  dUSDC claim failed (maybe cooldown):", e.message?.slice(0, 50));
  }

  // Step 2: Check balances
  const dethBalance = await deth.balanceOf(wallet.address);
  const dusdcBalance = await dusdc.balanceOf(wallet.address);
  console.log("\n💼 Wallet balances:");
  console.log("  dETH:", ethers.formatEther(dethBalance));
  console.log("  dUSDC:", ethers.formatUnits(dusdcBalance, 6));

  // Step 3: Transfer to SimpleSwap
  if (dethBalance > 0n) {
    console.log("\n📤 Transferring dETH to SimpleSwap...");
    const tx3 = await deth.transfer(SIMPLE_SWAP, dethBalance);
    await tx3.wait();
    console.log("✅ Transferred", ethers.formatEther(dethBalance), "dETH");
  }

  if (dusdcBalance > 0n) {
    console.log("📤 Transferring dUSDC to SimpleSwap...");
    const tx4 = await dusdc.transfer(SIMPLE_SWAP, dusdcBalance);
    await tx4.wait();
    console.log("✅ Transferred", ethers.formatUnits(dusdcBalance, 6), "dUSDC");
  }

  // Step 4: Check SimpleSwap reserves
  const swapDethBalance = await deth.balanceOf(SIMPLE_SWAP);
  const swapDusdcBalance = await dusdc.balanceOf(SIMPLE_SWAP);
  console.log("\n🏦 SimpleSwap reserves:");
  console.log("  dETH:", ethers.formatEther(swapDethBalance));
  console.log("  dUSDC:", ethers.formatUnits(swapDusdcBalance, 6));

  console.log("\n✅ Done! SimpleSwap is now funded and ready.");
}

main().catch(console.error);
