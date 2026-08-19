# Issue 7: Dispute Resolution & Arbitration Interface

## Title
`[Integration] Dispute Resolution & Arbitration Interface (Arbitrator Role & Split Settlement)`

## Overview
Now that `MilestoneEscrow.sol` and `ProductEscrow.sol` have been upgraded with `resolveDispute()` and an `arbitrator` role, this issue implements the arbitrator management UI for frozen escrows.

When a buyer/seller or creator/solver opens a dispute via `openDispute()`, funds are frozen in smart contract escrow until the assigned arbitrator settles the dispute by deciding a percentage split (0–100%) between the parties.

## Contract Reference
- **MilestoneEscrow**: `0x005e75c2F2cCD9205f498A5D0792561A989D9851`
- **ProductEscrow**: `0x006f02062876B24b138Ce56Ef6268Edad6d0CAa6`
- **Current Arbitrator**: `0x007abf8E01568a43499A1Ec754D0eD218d7c4074`

## Deliverables

### Arbitrator Dashboard UI (`/admin/disputes`)
- [ ] Create `/admin/disputes` page accessible only when the connected wallet matches `contract.arbitrator()`.
- [ ] Query and display all `DisputeInitiated` and `DisputeOpened` contract events.
- [ ] Show disputed item details, buyer/seller or creator/solver addresses, and total locked Qi.

### Dispute Resolution Modal
- [ ] Build interactive percentage slider (0% to 100%) for arbitrators to specify the split:
  - For Product Escrow: `_buyerPercent` (0% = 100% to seller, 100% = 100% refund to buyer, 50% = equal split).
  - For Milestone Escrow: `_creatorPercent` (0% = 100% to solver, 100% = 100% refund to creator).
- [ ] Display live preview calculation of exact Qi amounts to be transferred to both parties.
- [ ] Hook `resolveDispute(id, percent)` transaction trigger with toast lifecycle feedback.

### Role Transfer
- [ ] Hook `transferArbitrator(newAddr)` UI setting for current arbitrator to assign a new arbitrator wallet or DAO multisig.

## Acceptance Criteria
- Non-arbitrator wallets see "Unauthorized" state on `/admin/disputes`.
- Arbitrator can execute `resolveDispute()` to unfreeze and settle escrowed funds directly to both wallets.
- Resolved disputes automatically update status from "Disputed" to "Completed" across all dashboards.
