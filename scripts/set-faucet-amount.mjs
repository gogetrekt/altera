// Run with: node scripts/set-faucet-amount.mjs
// Make sure DEPLOYER_PRIVATE_KEY is set in .env.local

import { createWalletClient, createPublicClient, http, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';

config({ path: '.env.local' });

const DETH_FAUCET = "0xc0fc9dDA05803CA29e0eB44c104D17eC717435c8";
const DUSDC_FAUCET = "0x661A3e297a23Be077F6b3a3C5764773da4F3400e";

// New amounts
const NEW_DETH_AMOUNT = "0.005";  // 0.005 dETH
const NEW_DUSDC_AMOUNT = "10";    // 10 dUSDC

const FAUCET_ABI = [
  {
    name: 'setFaucetAmount',
    type: 'function',
    inputs: [{ name: 'amount', type: 'uint256' }],
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
    name: 'owner',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
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
  console.log("Using account:", account.address);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://1rpc.io/sepolia'),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http('https://1rpc.io/sepolia'),
  });

  // Check ownership
  const dethOwner = await publicClient.readContract({
    address: DETH_FAUCET,
    abi: FAUCET_ABI,
    functionName: 'owner',
  });
  const dusdcOwner = await publicClient.readContract({
    address: DUSDC_FAUCET,
    abi: FAUCET_ABI,
    functionName: 'owner',
  });

  console.log("\ndETH Faucet owner:", dethOwner);
  console.log("dUSDC Faucet owner:", dusdcOwner);
  console.log("Your address:", account.address);

  if (dethOwner.toLowerCase() !== account.address.toLowerCase()) {
    console.error("\n❌ You are not the owner of dETH faucet!");
    process.exit(1);
  }
  if (dusdcOwner.toLowerCase() !== account.address.toLowerCase()) {
    console.error("\n❌ You are not the owner of dUSDC faucet!");
    process.exit(1);
  }

  console.log("\n✅ You are the owner of both faucets\n");

  // Set dETH faucet amount (18 decimals)
  console.log(`Setting dETH faucet amount to ${NEW_DETH_AMOUNT} dETH...`);
  const dethAmount = parseUnits(NEW_DETH_AMOUNT, 18);
  console.log(`Amount in wei: ${dethAmount}`);
  
  const dethHash = await walletClient.writeContract({
    address: DETH_FAUCET,
    abi: FAUCET_ABI,
    functionName: 'setFaucetAmount',
    args: [dethAmount],
  });
  console.log("dETH tx hash:", dethHash);
  
  console.log("Waiting for confirmation...");
  await publicClient.waitForTransactionReceipt({ hash: dethHash });
  console.log("✅ dETH faucet amount updated!\n");

  // Set dUSDC faucet amount (6 decimals)
  console.log(`Setting dUSDC faucet amount to ${NEW_DUSDC_AMOUNT} dUSDC...`);
  const dusdcAmount = parseUnits(NEW_DUSDC_AMOUNT, 6);
  console.log(`Amount in smallest unit: ${dusdcAmount}`);
  
  const dusdcHash = await walletClient.writeContract({
    address: DUSDC_FAUCET,
    abi: FAUCET_ABI,
    functionName: 'setFaucetAmount',
    args: [dusdcAmount],
  });
  console.log("dUSDC tx hash:", dusdcHash);
  
  console.log("Waiting for confirmation...");
  await publicClient.waitForTransactionReceipt({ hash: dusdcHash });
  console.log("✅ dUSDC faucet amount updated!\n");

  // Verify new amounts
  console.log("Verifying new amounts...");
  const newDethAmount = await publicClient.readContract({
    address: DETH_FAUCET,
    abi: FAUCET_ABI,
    functionName: 'faucetAmount',
  });
  const newDusdcAmount = await publicClient.readContract({
    address: DUSDC_FAUCET,
    abi: FAUCET_ABI,
    functionName: 'faucetAmount',
  });

  console.log(`dETH new faucet amount: ${Number(newDethAmount) / 1e18} dETH`);
  console.log(`dUSDC new faucet amount: ${Number(newDusdcAmount) / 1e6} dUSDC`);
  console.log("\n🎉 Done!");
}

main().catch(console.error);
