// Run with: node scripts/check-faucet-viem.mjs
import { createPublicClient, http, formatUnits, keccak256, toHex } from 'viem';
import { sepolia } from 'viem/chains';

const DETH_FAUCET = "0xc0fc9dDA05803CA29e0eB44c104D17eC717435c8";
const DUSDC_FAUCET = "0x661A3e297a23Be077F6b3a3C5764773da4F3400e";
const DETH_TOKEN = "0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9";
const DUSDC_TOKEN = "0xecefA4372C0cb1D103527d6350d10E1556657292";

// Print function selectors
console.log("Function selectors:");
console.log("lastClaim(address):", keccak256(toHex("lastClaim(address)")).slice(0, 10));
console.log("faucetAmount():", keccak256(toHex("faucetAmount()")).slice(0, 10));
console.log("cooldown():", keccak256(toHex("cooldown()")).slice(0, 10));
console.log("claim():", keccak256(toHex("claim()")).slice(0, 10));
console.log("token():", keccak256(toHex("token()")).slice(0, 10));
console.log("");
console.log("From decompiled contract:");
console.log("unknown9c281430 = faucetAmount");
console.log("unknown5c16e15e = lastClaim mapping");

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
];

const FAUCET_ABI = [
  {
    name: 'faucetAmount',
    type: 'function',
    inputs: [],
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
  {
    name: 'lastClaim',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'token',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
];

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://1rpc.io/sepolia'),
});

async function checkFaucet(name, faucetAddress, tokenAddress, decimals) {
  console.log(`\n=== ${name} FAUCET ===`);
  console.log(`Faucet: ${faucetAddress}`);
  console.log(`Token: ${tokenAddress}`);
  
  try {
    // Check faucet token balance
    const balance = await client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [faucetAddress],
    });
    console.log(`Faucet balance: ${formatUnits(balance, decimals)} ${name}`);

    // Check claim amount (faucetAmount)
    const claimAmount = await client.readContract({
      address: faucetAddress,
      abi: FAUCET_ABI,
      functionName: 'faucetAmount',
    });
    console.log(`Claim amount: ${formatUnits(claimAmount, decimals)} ${name}`);

    // Check if balance is enough
    if (balance < claimAmount) {
      console.log(`⚠️  FAUCET EMPTY! Balance < Claim Amount`);
    } else {
      console.log(`✅ Faucet has enough balance`);
    }

    // Check cooldown
    const cooldown = await client.readContract({
      address: faucetAddress,
      abi: FAUCET_ABI,
      functionName: 'cooldown',
    });
    console.log(`Cooldown: ${cooldown} seconds (${Number(cooldown) / 3600} hours)`);

    // Check configured token
    try {
      const configuredToken = await client.readContract({
        address: faucetAddress,
        abi: FAUCET_ABI,
        functionName: 'token',
      });
      console.log(`Configured token: ${configuredToken}`);
      if (configuredToken.toLowerCase() !== tokenAddress.toLowerCase()) {
        console.log(`⚠️  TOKEN MISMATCH! Expected ${tokenAddress}`);
      }
    } catch (e) {
      console.log(`Could not read token address: ${e.message}`);
    }

  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

async function main() {
  console.log("Checking faucets on Sepolia...");
  
  await checkFaucet("dETH", DETH_FAUCET, DETH_TOKEN, 18);
  await checkFaucet("dUSDC", DUSDC_FAUCET, DUSDC_TOKEN, 6);
}

main().catch(console.error);
