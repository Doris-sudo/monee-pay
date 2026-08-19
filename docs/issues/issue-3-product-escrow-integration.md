# Issue 3: ProductEscrow Contract Integration & Protected Commerce Checkout

## Title
`[Integration] ProductEscrow Contract Integration & Protected Commerce Checkout`

## Overview
Integrate P2P product checkout, order management, and delivery verification flows with `ProductEscrow.sol` smart contract on Quai Network.

## Contract Reference
- **ProductEscrow Address**: `0x006f02062876B24b138Ce56Ef6268Edad6d0CAa6`
- **WQI Token Address**: `0x00384B879c117052527B3C93c1ab8525348dF64A`

## Deliverables
- [ ] Connect `createOrder()` hook for sellers specifying item details, price in Qi, and delivery deadline.
- [ ] Connect `depositEscrow()` hook for buyers to deposit exact Qi price into WQI smart escrow.
- [ ] Implement `confirmDelivery()` hook for buyer to trigger WQI unwrap and payout transfer to seller.
- [ ] Connect `claimTimeout()` hook allowing seller to claim funds after delivery deadline expires.
- [ ] Hook `openDispute()` allowing buyer or seller to freeze funds under conflict.

## Acceptance Criteria
- Checkout page displays active delivery deadline countdown timer.
- Clicking "Confirm Delivery" executes immediate trustless settlement.
- Seller can claim timeout refund automatically once deadline passes.
