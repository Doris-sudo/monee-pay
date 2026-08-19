# Issue 1: Web3 Wallet Connection & Dual-Ledger Provider (Pelagus Wallet & quais)

## Title
`[Integration] Web3 Wallet Connection & Dual-Ledger Provider (Pelagus Wallet & quais)`

## Overview
Establish seamless Web3 wallet connectivity for Quai Network (Cyprus-1 zone) using `@quainetwork/quais` and Pelagus Wallet extension. Abstract the native Qi (UTXO) to Wrapped Qi (`WQI`) ERC-20 dual-ledger flow for end users.

## Contract Reference
- **MockWQI**: `0x00354572C988dB5ca96827B091a59dAea71Bfbc6`
- **Network**: Quai Network Orchard Testnet (Cyprus-1 Zone, Chain ID: `15000`)

## Deliverables
- [ ] Create `Web3Provider` React Context and `useWallet` hook for account state.
- [ ] Implement Pelagus Wallet detection, connection toggle, and account change event listeners.
- [ ] Add network validation to automatically prompt switching to Cyprus-1 (`chainId: 15000`).
- [ ] Build real-time balance tracking hook for QUAI, Native Qi, and Wrapped Qi (`WQI`).
- [ ] Implement 1-click auto-wrap helper for native Qi → WQI on escrow deposit.

## Acceptance Criteria
- User can connect/disconnect Pelagus wallet with 1-click from the navigation bar.
- Display truncated address (e.g. `0x007a...4074`) and live Qi / WQI balances.
- Clear error notification when Pelagus Wallet extension is missing.
