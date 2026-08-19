# Issue 3: ProductEscrow Contract Integration & Protected Commerce Checkout

## Title
`[Integration] ProductEscrow Contract Integration & Protected Commerce Checkout`

## Overview
Integrate P2P product checkout, order management, and delivery verification flows with `ProductEscrow.sol` smart contract on Quai Network.

## Contract Reference
- **ProductEscrow Address**: `0x0067f487e59f0C45922854F32B6d8deD8e820776`
- **WQI Token Address**: `0x00354572C988dB5ca96827B091a59dAea71Bfbc6`

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
