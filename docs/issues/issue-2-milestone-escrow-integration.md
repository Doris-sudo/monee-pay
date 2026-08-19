# Issue 2: MilestoneEscrow Contract Integration & Task Bounty UI Workflow

## Title
`[Integration] MilestoneEscrow Contract Integration & Task Bounty UI Workflow`

## Overview
Connect frontend task reward components and discovery marketplace to the `MilestoneEscrow.sol` smart contract on Quai Network.

## Contract Reference
- **MilestoneEscrow Address**: `0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA`
- **WQI Token Address**: `0x00354572C988dB5ca96827B091a59dAea71Bfbc6`

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
