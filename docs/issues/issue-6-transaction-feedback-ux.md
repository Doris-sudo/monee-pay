# Issue 6: Transaction Feedback UX — Toasts, Confirmations, Error Handling & Block Explorer Links

## Title
`[Integration] Transaction Feedback UX — Toasts, Confirmations, Error Handling & Block Explorer Links`

## Overview
Every smart contract write operation (escrow deposits, milestone approvals, payroll disbursements, dispute openings) currently has **zero user feedback**. Users have no way to know if a transaction was submitted, is pending, succeeded, or failed. This issue adds a complete transaction lifecycle UX layer.

## Current State
- No toast / notification system exists in the app.
- No loading spinners or progress indicators during wallet signing prompts.
- No success confirmations with transaction hash links.
- No error handling for reverted transactions, insufficient balance, or user-rejected signing.
- The payroll page has a simulated `processStep` state machine (steps 1–4) but it's entirely fake — no real tx is fired.

## Deliverables

### Toast Notification System
- [ ] Create `ToastProvider` context and `useToast()` hook in `frontend/src/components/ui/Toast.js`.
- [ ] Support toast variants: `success` (green), `error` (red), `warning` (amber), `info` (blue), `loading` (animated spinner).
- [ ] Auto-dismiss after 6 seconds with manual close button. Loading toasts persist until resolved.
- [ ] Stack multiple toasts vertically (bottom-right corner) with smooth slide-in/out animations.

### Transaction Lifecycle Wrapper
- [ ] Create `useSendTransaction()` hook in `frontend/src/hooks/useSendTransaction.js` wrapping the full tx lifecycle:
  1. **Wallet Prompt** — Show "Waiting for wallet approval..." loading toast when `wallet.sendTransaction()` or `contract.functionName()` is called.
  2. **Tx Broadcast** — Show "Transaction submitted!" info toast with truncated tx hash.
  3. **Pending Confirmation** — Show "Confirming on-chain..." loading toast with animated progress.
  4. **Success** — Show "Transaction confirmed!" success toast with clickable Quaiscan explorer link: `https://orchard.quaiscan.io/tx/{txHash}`.
  5. **Failure / Revert** — Show "Transaction failed" error toast with human-readable revert reason (parse `CALL_EXCEPTION` errors).
  6. **User Rejected** — Show "Transaction cancelled" warning toast when user clicks "Reject" in Pelagus wallet.

### Error Handling
- [ ] Parse common `quais` error codes:
  - `ACTION_REJECTED` → "You rejected the transaction in your wallet."
  - `INSUFFICIENT_FUNDS` → "Insufficient Qi/WQI balance. Please top up your wallet."
  - `CALL_EXCEPTION` → Extract and display Solidity custom error / revert string.
  - `NETWORK_ERROR` → "Network error. Please check your connection and try again."
  - `NONCE_EXPIRED` → "Transaction nonce conflict. Please try again."
- [ ] Add global error boundary fallback for uncaught transaction errors.

### Block Explorer Integration
- [ ] Create `ExplorerLink` component: clickable link that opens `https://orchard.quaiscan.io/tx/{hash}` or `https://orchard.quaiscan.io/address/{addr}` in a new tab.
- [ ] Show explorer links in:
  - Success toasts (tx hash link).
  - Dashboard transaction history table (per-row tx link).
  - Order detail page (escrow deposit tx, delivery confirmation tx).
  - Payroll page (batch disbursement tx receipt).

### Wallet Connection Error States
- [ ] "Pelagus Wallet not detected" modal with install link (`https://pelagus.io`).
- [ ] "Wrong network" banner prompting user to switch to Quai Orchard Testnet (Cyprus-1, chainId `15000`).
- [ ] "Session expired / wallet disconnected" auto-detect and prompt reconnect.

## Acceptance Criteria
- Every contract write operation shows a toast notification through its full lifecycle (prompt → broadcast → confirm → success/fail).
- Failed transactions show a human-readable error message, not raw hex or stack traces.
- Every successful transaction shows a clickable Quaiscan link to verify on-chain.
- Users who haven't installed Pelagus or are on the wrong network see clear, actionable prompts.
- Loading toasts block duplicate submissions (disable submit button while tx is pending).

## Dependencies
- Blocked by **Issue #24** (Web3 Wallet Connection) — needs wallet provider to fire transactions.
- Works alongside **Issues #25, #26, #27** — each contract integration issue triggers transactions that need this feedback layer.
