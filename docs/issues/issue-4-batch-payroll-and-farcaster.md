# Issue 4: BatchPayroll Contract & Farcaster Frame v2 Mini App SDK Integration

## Title
`[Integration] BatchPayroll Contract & Farcaster Frame v2 Mini App SDK Integration`

## Overview
Connect corporate batch payroll processing with `BatchPayroll.sol` and finalize native Farcaster Frame v2 / Mini App SDK integration (`@farcaster/frame-sdk`).

## Contract Reference
- **BatchPayroll Address**: `0x006af39747bD49a5278610C274Ba96B013D07EE3`
- **WQI Token Address**: `0x00384B879c117052527B3C93c1ab8525348dF64A`

## Deliverables
- [ ] Build CSV file uploader and recipient parser for batch payroll disbursements.
- [ ] Connect `disburseBatch()` hook for single-tx multi-recipient salary disbursements (95% gas savings).
- [ ] Hook admin RBAC management methods: `grantAdmin()`, `revokeAdmin()`, and `transferOwnership()`.
- [ ] Complete Farcaster Frame v2 SDK integration (`sdk.actions.ready()`, `sdk.actions.addFrame()`).
- [ ] Implement Farcaster in-feed frame unfurl tags (`fc:frame`) and `FarcasterShareButton.js` for 1-click Warpcast casting.

## Acceptance Criteria
- Drag-and-drop CSV payroll parser validates wallet addresses and amounts.
- Single click executes batch disbursement transaction.
- Posting any MoneePay link on Warpcast unfurls an interactive payment frame button with 1-tap launcher pinning.
