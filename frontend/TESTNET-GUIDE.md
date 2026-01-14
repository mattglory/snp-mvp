# SNP Frontend - Testnet Testing Guide

## Overview

This document provides instructions for testing the SNP Protocol frontend application on the Stacks testnet. The frontend includes wallet integration and vault interaction capabilities for depositing and withdrawing assets.

## Features

### Wallet Integration

**File**: `hooks/useWallet.ts`

- Leather, Hiro, and Xverse wallet support
- Automatic reconnection on page load
- Testnet address handling
- Wallet connection and disconnection flow

### Vault Contract Integration

**File**: `hooks/useVaultContract.ts`

- Deposit STX to vaults
- Withdraw shares from vaults
- Slippage protection
- Transaction broadcasting
- Post-conditions for security

### Deposit/Withdraw Interface

**File**: `components/DepositWithdraw.tsx`

- Real-time slippage calculation
- Transaction status tracking
- Block explorer links
- Error handling and validation

### User Balance Display

**File**: `components/UserBalance.tsx`

- STX balance display with auto-refresh
- Quick access to testnet faucet
- Explorer link for address details

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- A Stacks-compatible wallet extension (Leather, Hiro, or Xverse)
- Testnet STX tokens

### Installation

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Obtaining Testnet STX

### Install a Wallet

Choose one of the following wallets:

- **Leather Wallet**: https://leather.io/install-extension
- **Hiro Wallet**: https://wallet.hiro.so/wallet/install-web
- **Xverse**: https://www.xverse.app/

### Request Testnet Tokens

1. Visit the Stacks testnet faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Enter your testnet address
3. Submit the request to receive 500 testnet STX

## Testing Procedures

### Basic Deposit Flow

1. Connect wallet using the "Connect Wallet" button
2. Approve the connection request in your wallet
3. Select a vault (Conservative, Balanced, or Growth)
4. Enter deposit amount
5. Configure slippage tolerance (1% recommended)
6. Submit transaction via "Deposit STX" button
7. Confirm transaction in wallet
8. Monitor transaction status on the block explorer

### Withdraw Flow

1. Ensure wallet is connected
2. Select the vault containing your shares
3. Switch to "Withdraw" mode
4. Enter the number of shares to withdraw
5. Configure slippage tolerance
6. Submit transaction
7. Confirm in wallet

### Testing Checklist

**Core Functionality**:
- Connect wallet (Leather/Hiro/Xverse)
- Verify address display in header
- Navigate between vaults
- Deposit STX to Conservative vault
- View transaction on block explorer
- Wait for transaction confirmation
- Check vault balance
- Withdraw shares
- Disconnect wallet

**Edge Cases**:
- Attempt deposit with zero amount
- Attempt transaction without wallet connection
- Cancel transaction in wallet popup
- Modify slippage tolerance
- Test all three vault types

## Contract Addresses

**Network**: Stacks Testnet

**Deployer**: `ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA`

**Vault Contracts**:
- Conservative: `ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.vault-conservative`
- Balanced: `ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.vault-stx-v2`
- Growth: `ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.vault-growth`

**Block Explorer**: https://explorer.hiro.so/address/ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA?chain=testnet

## Troubleshooting

### Wallet Connection Issues

**Problem**: "Connect Wallet" button does not respond

**Solution**: Verify that a compatible wallet extension is installed in your browser. Supported wallets include Leather, Hiro, and Xverse.

### Transaction Failures

**Problem**: Transaction fails to submit

**Solution**: Verify sufficient testnet STX balance. Request additional tokens from the faucet if needed: https://explorer.hiro.so/sandbox/faucet?chain=testnet

### Dependency Errors

**Problem**: Module not found errors for @stacks packages

**Solution**: Install required dependencies:

```bash
cd frontend
npm install @stacks/connect @stacks/transactions @stacks/network
```

### Network Configuration

**Problem**: Wallet not displaying testnet network

**Solution**:
- Leather: Use network switcher to select "Testnet"
- Hiro: Navigate to Settings > Network > Testnet

## File Structure

```
frontend/src/
├── hooks/
│   ├── useWallet.ts           # Wallet connection logic
│   └── useVaultContract.ts    # Contract interactions
├── components/
│   ├── DepositWithdraw.tsx    # Main interaction UI
│   ├── UserBalance.tsx        # Balance display
│   ├── VaultSelector.tsx
│   ├── VaultDashboard.tsx
│   └── AllocationVisualization.tsx
├── App.tsx                     # Main application
├── config.ts                   # Contract addresses
└── utils/
    └── formatting.ts
```

## Technical Details

### Supported Wallets

- Leather Wallet
- Hiro Wallet
- Xverse Wallet

### Network Configuration

The application is currently configured for Stacks testnet. Network configuration can be modified in the hook files for mainnet deployment.

### Security Features

- Post-conditions prevent unexpected token transfers
- Slippage protection prevents front-running attacks
- Transaction deadlines prevent stale transaction execution

## Demo Recording Checklist

For demonstration purposes, the following flow provides comprehensive coverage:

1. Display application interface
2. Connect wallet
3. Select vault type
4. Enter deposit amount and configure slippage
5. Submit transaction
6. Display transaction on block explorer
7. Wait for confirmation
8. Verify transaction success

## Current Implementation Status

**Implemented Features**:
- Wallet connection and disconnection
- Transaction submission for deposits and withdrawals
- User interface with vault selection
- Testnet integration

**Known Limitations**:
- Balance display requires manual refresh
- Vault state must be queried separately
- Transaction history not tracked in UI
- Limited loading state indicators
