// Run with: node scripts/test-claim.mjs
// Make sure DEPLOYER_PRIVATE_KEY is set in .env.local

import { createWalletClient, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';

config({ path: '.env.local' });

const DETH_FAUCET = "0xc0fc9dDA05803CA29e0eB44c104D17eC717435c8";

const FAUCET_ABI = [
  {
    name: 'claim',
    type: 'function',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'faucetAmount',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'lastClaim',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
];

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("DEPLOYER_PRIVATE_KEY not found in .env.local");
    process.exit(1);
  }

  const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);
  console.log("Testing claim with account:", account.address);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://1rpc.io/sepolia'),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http('https://1rpc.io/sepolia'),
  });

  // Check last claim
  console.log("\nChecking last claim...");
  const lastClaim = await publicClient.readContract({
    address: DETH_FAUCET,
    abi: FAUCET_ABI,
    functionName: 'lastClaim',
    args: [account.address],
  });
  console.log("Last claim timestamp:", lastClaim);
  
  if (lastClaim > 0n) {
    const lastClaimDate = new Date(Number(lastClaim) * 1000);
    console.log("Last claim date:", lastClaimDate.toISOString());
    
    const cooldown = 86400; // 24 hours
    const nextClaimTime = Number(lastClaim) + cooldown;
    const now = Math.floor(Date.now() / 1000);
    
    if (now < nextClaimTime) {
      console.log(`❌ Cooldown not expired yet. Can claim in ${nextClaimTime - now} seconds`);
      process.exit(0);
    }
  }

  // Try to claim
  console.log("\nAttempting claim...");
  try {
    const hash = await walletClient.writeContract({
      address: DETH_FAUCET,
      abi: FAUCET_ABI,
      functionName: 'claim',
    });
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Status:", receipt.status);
    
    if (receipt.status === 'success') {
      console.log("✅ Claim successful!");
    } else {
      console.log("❌ Claim failed - transaction reverted");
      console.log("Reason:", receipt.logs);
    }
  } catch (error) {
    console.log("❌ Claim error:");
    console.log("Message:", error.message);
    console.log("Details:", error);
  }
}

main().catch(console.error);
