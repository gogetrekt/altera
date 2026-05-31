# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Send a report to: security@archivecircle.xyz

Include in your report:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations, if applicable

You will receive an acknowledgement within 72 hours. We will keep you informed of the remediation timeline.

## Audit Status

The smart contracts in this repository have not undergone a formal third-party security audit.

Baseline security hardening has been applied to the contracts as part of an internal audit remediation process (Phases 1 through 4). This includes:
- Supply caps and rate caps on minting and reward contracts
- SafeERC20 usage across all transfer paths
- ReentrancyGuard on swap functions
- Baseline Hardhat unit tests for contract safety properties

None of this constitutes a formal audit by an independent security firm. Do not treat any contract in this repository as production-safe. All contracts are provided for testnet use only unless explicitly stated otherwise.

The project is not production-ready. A formal third-party audit is required before any mainnet deployment of custom contracts.

## Mainnet Interactions

The Genesis Pass NFT feature operates on Base Mainnet and involves real ETH. Exercise caution:
- Verify contract addresses before signing any transaction
- Use a dedicated wallet with limited funds for testing
- Understand that transactions on Base Mainnet are irreversible

All other DeFi features (swap, liquidity, staking, faucet) operate on Sepolia testnet and involve no real funds.

## Scope

The following are in scope for vulnerability reports:
- Smart contracts in `/contracts/`
- Frontend transaction flows in `/app/`
- Web3 integration in `/lib/`
- Configuration files that could expose credentials or enable unsafe behavior

Out of scope:
- Issues in third-party dependencies (report those upstream)
- Issues already documented in the public audit findings
- UI cosmetic bugs unrelated to funds or security

## Responsible Disclosure

We ask that you:
- Give us reasonable time to remediate before public disclosure
- Not access, modify, or delete data belonging to other users
- Not perform denial-of-service attacks
- Not conduct testing on mainnet contracts with funds that are not yours
