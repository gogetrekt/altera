// Run with: node scripts/check-wallet-status.mjs <wallet_address>
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';

const DETH_FAUCET = "0xc0fc9dDA05803CA29e0eB44c104D17eC717435c8";
const DUSDC_FAUCET = "0x661A3e297a23Be077F6b3a3C5764773da4F3400e";

const FAUCET_ABI = [
  {
    name: 'lastClaim',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'cooldown',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
];

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://1rpc.io/sepolia'),
});

async function main() {
  // Get wallet address from command line or use default
  const walletAddress = process.argv[2] || "0x8f49Ab0D";
  
  if (!walletAddress || walletAddress.length < 10) {
    console.log("Usage: node scripts/check-wallet-status.mjs <full_wallet_address>");
    console.log("Example: node scripts/check-wallet-status.mjs 0x8f49...Ab0D");
    process.exit(1);
  }

  console.log(`Checking status for wallet: ${walletAddress}`);
  console.log("");

  const now = Math.floor(Date.now() / 1000);

  // Check dETH
  console.log("=== dETH Faucet ===");
  try {
    const dethLastClaim = await client.readContract({
      address: DETH_FAUCET,
      abi: FAUCET_ABI,
      functionName: 'lastClaim',
      args: [walletAddress],
    });
    const dethCooldown = await client.readContract({
      address: DETH_FAUCET,
      abi: FAUCET_ABI,
      functionName: 'cooldown',
    });
    
    console.log("Last claim timestamp:", dethLastClaim.toString());
    if (dethLastClaim > 0n) {
      console.log("Last claim date:", new Date(Number(dethLastClaim) * 1000).toISOString());
      const nextClaim = Number(dethLastClaim) + Number(dethCooldown);
      if (now < nextClaim) {
        console.log(`❌ Cooldown active. Can claim in ${nextClaim - now} seconds (${Math.round((nextClaim - now) / 3600)} hours)`);
      } else {
        console.log("✅ Can claim NOW!");
      }
    } else {
      console.log("✅ Never claimed before - can claim NOW!");
    }
  } catch (e) {
    console.log("Error:", e.message);
  }

  console.log("");

  // Check dUSDC
  console.log("=== dUSDC Faucet ===");
  try {
    const dusdcLastClaim = await client.readContract({
      address: DUSDC_FAUCET,
      abi: FAUCET_ABI,
      functionName: 'lastClaim',
      args: [walletAddress],
    });
    const dusdcCooldown = await client.readContract({
      address: DUSDC_FAUCET,
      abi: FAUCET_ABI,
      functionName: 'cooldown',
    });
    
    console.log("Last claim timestamp:", dusdcLastClaim.toString());
    if (dusdcLastClaim > 0n) {
      console.log("Last claim date:", new Date(Number(dusdcLastClaim) * 1000).toISOString());
      const nextClaim = Number(dusdcLastClaim) + Number(dusdcCooldown);
      if (now < nextClaim) {
        console.log(`❌ Cooldown active. Can claim in ${nextClaim - now} seconds (${Math.round((nextClaim - now) / 3600)} hours)`);
      } else {
        console.log("✅ Can claim NOW!");
      }
    } else {
      console.log("✅ Never claimed before - can claim NOW!");
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}

main().catch(console.error);
