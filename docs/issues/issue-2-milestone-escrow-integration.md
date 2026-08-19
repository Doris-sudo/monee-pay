# Issue 2: MilestoneEscrow Contract Integration & Task Bounty UI Workflow

## Title
`[Integration] MilestoneEscrow Contract Integration & Task Bounty UI Workflow`

## Overview
Connect frontend task reward components and discovery marketplace to the `MilestoneEscrow.sol` smart contract on Quai Network.

## Contract Reference
- **MilestoneEscrow Address**: `0x005e75c2F2cCD9205f498A5D0792561A989D9851`
- **WQI Token Address**: `0x00384B879c117052527B3C93c1ab8525348dF64A`

## Deliverables
- [ ] Connect `createTask()` to Task Creation Form with tranche percentage validation (sum to 100%).
- [ ] Implement `assignSolver()` hook and workspace UI for task creator to assign a solver wallet.
- [ ] Implement `approveMilestone()` hook to release tranche payouts (WQI → Qi) upon milestone delivery.
- [ ] Hook `openDispute()` to freeze remaining escrow funds during disputes.
- [ ] Hook `cancelTask()` for creator full refund prior to solver assignment.

## Acceptance Criteria
- Task creation validates inputs and executes single-tx Qi wrap & escrow lock.
- Solvers and creators receive real-time UI status updates on milestone approvals.
- Full test coverage for task lifecycle methods.
