# StellarFlow Time-Locked Escrow Vault

StellarFlow Vault is a decentralized application (dApp) built on the Stellar network using Soroban smart contracts. It allows users to securely lock their XLM in a time-bound escrow contract that cannot be withdrawn by anyone (even the creator) until the specified time duration has passed. 

This project demonstrates cross-contract authentication (L2/L3) and secure escrow management on the Stellar Testnet, featuring seamless Web3 mobile wallet support via WalletConnect.

## Features

- **Time-Locked Deposits**: Users can deposit testnet XLM and set a rigid time lock (e.g. 10 years).
- **Immutable Security**: The smart contract enforces the time lock. Funds are completely unwithdrawable until the time lock expires.
- **Cross-Contract Policy**: Implements an advanced L2/L3 policy contract that governs the withdrawal logic of the main escrow contract.
- **Mobile-First Web3 Connection**: Fully integrated with `@creit.tech/stellar-wallets-kit` to allow desktop and mobile users to securely connect their wallets via Freighter, Albedo, or WalletConnect (e.g. xBull, Lobstr).
- **Responsive UI**: Built with Next.js, Tailwind CSS, and Framer Motion for a stunning, smooth, micro-animated user experience.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, Lucide React
- **State Management**: Zustand
- **Web3 / Blockchain**: 
  - `@stellar/stellar-sdk` (v16) for RPC communication.
  - `@creit.tech/stellar-wallets-kit` for versatile wallet connection and transaction signing.
- **Network**: Stellar Soroban Testnet

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Be-bibek/web3-TimeLockNotExpired.git
   cd web3-TimeLockNotExpired
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

*Note for Mobile Testing: Because WalletConnect requires a secure context for its cryptographic functions (`window.crypto.subtle`), you must tunnel your local server via HTTPS to test on a mobile device (e.g., using `npx localtunnel --port 3000` or `npx ngrok http 3000`), or deploy the application to Vercel.*

## Smart Contract Integration

The dApp communicates with two Soroban smart contracts on the Testnet:
1. **Escrow Contract**: Manages the locked balances and timestamps.
2. **Policy Contract**: Authorizes or rejects withdrawals based on custom cross-contract governance rules.

These contracts ensure that neither the user nor malicious actors can bypass the time lock.
