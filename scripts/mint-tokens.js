const { ethers } = require("ethers");
require("dotenv").config({ path: ".env.local" });

// Token addresses
const DETH = "0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9";
const DUSDC = "0xecefA4372C0cb1D103527d6350d10E1556657292";

// Mint ABI (standard for Ownable ERC20 with mint)
const MINT_ABI = [
  "function mint(address to, uint256 amount) external",
  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  console.log("🪙 Direct Token Minting (Owner Only)\n");
  console.log("Wallet:", wallet.address);

  const deth = new ethers.Contract(DETH, MINT_ABI, wallet);
  const dusdc = new ethers.Contract(DUSDC, MINT_ABI, wallet);

  // Check ownership
  const dethOwner = await deth.owner();
  const dusdcOwner = await dusdc.owner();
  console.log("\ndETH owner:", dethOwner);
  console.log("dUSDC owner:", dusdcOwner);

  const recipient = process.argv[2] || wallet.address;
  const amount = process.argv[3] || "1000000"; // Default 1M

  console.log("\n📤 Minting to:", recipient);
  console.log("Amount:", amount);

  // Mint dETH (18 decimals)
  console.log("\n⏳ Minting dETH...");
  try {
    const tx1 = await deth.mint(recipient, ethers.parseEther(amount));
    await tx1.wait();
    console.log("✅ Minted", amount, "dETH");
  } catch (e) {
    console.log("❌ dETH mint failed:", e.reason || e.message?.slice(0, 80));
  }

  // Mint dUSDC (6 decimals)
  console.log("⏳ Minting dUSDC...");
  try {
    const tx2 = await dusdc.mint(recipient, ethers.parseUnits(amount, 6));
    await tx2.wait();
    console.log("✅ Minted", amount, "dUSDC");
  } catch (e) {
    console.log("❌ dUSDC mint failed:", e.reason || e.message?.slice(0, 80));
  }

  // Check balances
  const dethBal = await deth.balanceOf(recipient);
  const dusdcBal = await dusdc.balanceOf(recipient);
  console.log("\n💰 Final balances for", recipient);
  console.log("  dETH:", ethers.formatEther(dethBal));
  console.log("  dUSDC:", ethers.formatUnits(dusdcBal, 6));
}

main().catch(console.error);
