# Issue 5: On-Chain Data Layer & Event Indexing — Replace Mock Data with Live Blockchain State

## Title
`[Integration] On-Chain Data Layer & Event Indexing — Replace Mock Data with Live Blockchain State`

## Overview
Every page in the MoneePay frontend currently renders **hardcoded mock arrays** (`useState` with static seed data). This issue replaces all mock data sources with real-time on-chain reads from deployed smart contracts using `quais` SDK event logs and view function calls.

Without this, users will see fake placeholder data instead of actual tasks, orders, and payroll records stored on-chain.

## Contract Reference
| Contract | Address |
|----------|---------|
| MockWQI | `0x00354572C988dB5ca96827B091a59dAea71Bfbc6` |
| MilestoneEscrow | `0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA` |
| ProductEscrow | `0x0067f487e59f0C45922854F32B6d8deD8e820776` |
| BatchPayroll | `0x001C2F6C68d3F493FF2b9c017e334DD7685f5daB` |

## Current State (What Needs Replacing)

### `/tasks` — Task Discovery & Marketplace
- **Now:** Hardcoded array of task objects with fake titles, rewards, and statuses.
- **Target:** Query `MilestoneEscrow` contract events (`TaskCreated`, `SolverAssigned`, `MilestoneApproved`) and view functions (`getTask()`, `getTaskCount()`) to populate the task discovery grid.

### `/marketplace` — Product Listings
- **Now:** Static product cards with placeholder images and prices.
- **Target:** Query `ProductEscrow` events (`OrderCreated`) and view functions (`getOrder()`, `getOrderCount()`) to populate live product listings with real prices, sellers, and escrow status.

### `/dashboard` — User Dashboard & Stats
- **Now:** `StatsGrid` and `StatsBar` render hardcoded numbers (total tasks, total volume, active escrows).
- **Target:** Aggregate on-chain data: count active escrows, sum locked WQI, count completed payouts per connected wallet address.

### `/order/[id]` — Order Detail Page
- **Now:** Placeholder order data.
- **Target:** Fetch single order from `ProductEscrow.getOrder(orderId)` and render real buyer/seller addresses, escrowed amount, delivery deadline countdown, and current status.

### `/payroll` — Payroll Page
- **Now:** Hardcoded employee array with fake names, roles, and amounts.
- **Target:** Query `BatchPayroll` events (`BatchDisbursed`, `AdminGranted`) to show payroll history. Employee list should come from CSV upload (already exists) rather than seed data.

## Deliverables

### React Hooks (new files in `frontend/src/hooks/`)
- [ ] `useContractRead.js` — Generic hook wrapping `quais.Contract` view function calls with loading/error state and auto-refresh.
- [ ] `useContractEvents.js` — Generic hook for querying past event logs with pagination and real-time subscription via `contract.on()`.
- [ ] `useMilestoneEscrow.js` — Domain hook exposing `tasks[]`, `taskCount`, `getTask(id)`, and event-driven live updates.
- [ ] `useProductEscrow.js` — Domain hook exposing `orders[]`, `orderCount`, `getOrder(id)`, and event-driven live updates.
- [ ] `useBatchPayroll.js` — Domain hook exposing `payrollHistory[]`, `isAdmin`, and past disbursement records.
- [ ] `useWQIToken.js` — Hook for WQI balance reads, allowance checks, and `approve()` calls.

### Page Updates
- [ ] Replace hardcoded `useState` arrays in `/tasks/page.js` with `useMilestoneEscrow()`.
- [ ] Replace hardcoded data in `/marketplace/page.js` with `useProductEscrow()`.
- [ ] Replace hardcoded stats in `/dashboard/page.js` with aggregated on-chain queries.
- [ ] Replace hardcoded order in `/order/[id]/page.js` with `useProductEscrow().getOrder(id)`.
- [ ] Replace hardcoded employees in `/payroll/page.js` seed data — keep CSV upload as primary input.

### Empty State & Loading UI
- [ ] Add skeleton loaders / shimmer placeholders while on-chain data is fetching.
- [ ] Add "No tasks found" / "No orders yet" empty state components when contract returns zero records.
- [ ] Add "Connect Wallet" prompt when user hasn't connected Pelagus (depends on Issue #24).

## Acceptance Criteria
- All pages render **real on-chain data** when contracts have state, and **graceful empty states** when they don't.
- Dashboard stats reflect actual locked WQI volume and completed transaction counts.
- Data auto-refreshes when new on-chain events are emitted (no manual page reload required).
- Zero hardcoded mock data remains in production page components.

## Dependencies
- Blocked by **Issue #24** (Web3 Wallet Connection) — needs connected provider to query contracts.
