const { ethers } = require("hardhat");

const DETH_FAUCET = "0xc0fc9dDA05803CA29e0eB44c104D17eC717435c8";
const DUSDC_FAUCET = "0x661A3e297a23Be077F6b3a3C5764773da4F3400e";
const DETH_TOKEN = "0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9";
const DUSDC_TOKEN = "0xecefA4372C0cb1D103527d6350d10E1556657292";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const FAUCET_ABI = [
  "function claimAmount() view returns (uint256)",
  "function cooldownTime() view returns (uint256)",
  "function lastClaim(address) view returns (uint256)",
  "function token() view returns (address)",
  "function owner() view returns (address)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Checking with address:", signer.address);
  console.log("---");

  // Check dETH Faucet
  console.log("=== dETH FAUCET ===");
  try {
    const dethFaucet = new ethers.Contract(DETH_FAUCET, FAUCET_ABI, signer);
    const dethToken = new ethers.Contract(DETH_TOKEN, ERC20_ABI, signer);

    const dethBalance = await dethToken.balanceOf(DETH_FAUCET);
    const dethDecimals = await dethToken.decimals();
    const dethClaimAmount = await dethFaucet.claimAmount();
    const dethCooldown = await dethFaucet.cooldownTime();
    const dethLastClaim = await dethFaucet.lastClaim(signer.address);

    console.log("Faucet balance:", ethers.formatUnits(dethBalance, dethDecimals), "dETH");
    console.log("Claim amount:", ethers.formatUnits(dethClaimAmount, dethDecimals), "dETH");
    console.log("Cooldown time:", dethCooldown.toString(), "seconds");
    console.log("Your last claim:", dethLastClaim.toString());
    
    if (dethLastClaim > 0n) {
      const nextClaim = Number(dethLastClaim) + Number(dethCooldown);
      const now = Math.floor(Date.now() / 1000);
      if (nextClaim > now) {
        console.log("Can claim in:", nextClaim - now, "seconds");
      } else {
        console.log("Can claim NOW");
      }
    } else {
      console.log("Never claimed - can claim NOW");
    }

    if (dethBalance < dethClaimAmount) {
      console.log("⚠️  FAUCET EMPTY - not enough balance!");
    }
  } catch (e) {
    console.log("Error reading dETH faucet:", e.message);
  }

  console.log("---");

  // Check dUSDC Faucet
  console.log("=== dUSDC FAUCET ===");
  try {
    const dusdcFaucet = new ethers.Contract(DUSDC_FAUCET, FAUCET_ABI, signer);
    const dusdcToken = new ethers.Contract(DUSDC_TOKEN, ERC20_ABI, signer);

    const dusdcBalance = await dusdcToken.balanceOf(DUSDC_FAUCET);
    const dusdcDecimals = await dusdcToken.decimals();
    const dusdcClaimAmount = await dusdcFaucet.claimAmount();
    const dusdcCooldown = await dusdcFaucet.cooldownTime();
    const dusdcLastClaim = await dusdcFaucet.lastClaim(signer.address);

    console.log("Faucet balance:", ethers.formatUnits(dusdcBalance, dusdcDecimals), "dUSDC");
    console.log("Claim amount:", ethers.formatUnits(dusdcClaimAmount, dusdcDecimals), "dUSDC");
    console.log("Cooldown time:", dusdcCooldown.toString(), "seconds");
    console.log("Your last claim:", dusdcLastClaim.toString());

    if (dusdcLastClaim > 0n) {
      const nextClaim = Number(dusdcLastClaim) + Number(dusdcCooldown);
      const now = Math.floor(Date.now() / 1000);
      if (nextClaim > now) {
        console.log("Can claim in:", nextClaim - now, "seconds");
      } else {
        console.log("Can claim NOW");
      }
    } else {
      console.log("Never claimed - can claim NOW");
    }

    if (dusdcBalance < dusdcClaimAmount) {
      console.log("⚠️  FAUCET EMPTY - not enough balance!");
    }
  } catch (e) {
    console.log("Error reading dUSDC faucet:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
