# MoneePay Core Use Cases & Platform Specification

**Trustless Commerce, Task Bounties, and Team Payroll on Quai Network**

MoneePay is a smart-contract-powered escrow payment protocol built on the [Quai Network](https://qu.ai) and integrated as a native **Farcaster Frame v2 / Mini App**. 

MoneePay solves trust fragmentation in online transactions across **3 core pillars**:

---

## 📑 Table of Contents
1. [Pillar 1: Freelance Bounties & Task Rewards](#1-freelance-bounties--task-rewards)
2. [Pillar 2: Peer-to-Peer Commerce & Product Sales](#2-peer-to-peer-commerce--product-sales)
3. [Pillar 3: MoneePay for Teams (Corporate Payroll)](#3-moneepay-for-teams-corporate-payroll)
4. [Quai Network Dual-Ledger Architecture (Qi & WQI)](#4-quai-network-dual-ledger-architecture-qi--wqi)
5. [Native Farcaster Mini App & Frame v2 Integration](#5-native-farcaster-mini-app--frame-v2-integration)

---

## 1. Freelance Bounties & Task Rewards

### The Problem
Freelancers fear working on complex tasks without guaranteed payment; project creators fear paying upfront for incomplete or poor-quality work.

### The MoneePay Solution
Anyone can post a task or project bounty with milestone-gated escrow:

```
[ Task Creator ] ──Locks 1,200 Qi──> [ Escrow Contract ] ──Milestone 1 (400 Qi)──> [ Freelancer ]
                                     [  (WQI Locked)   ] ──Milestone 2 (400 Qi)──> [ Freelancer ]
                                                         ──Milestone 3 (400 Qi)──> [ Freelancer ]
```

### Workflow
1. **Define Task & Tranches**: Creator posts a task (e.g. *"Audit Smart Contract — 1,200 Qi"* split into 3 milestone tranches).
2. **Lock Reward Upfront**: The full `1,200 Qi` is locked inside the smart contract escrow.
3. **Guaranteed Execution**: Solvers build with 100% certainty that the reward is secured.
4. **Tranche Approval & Payout**: As each milestone deliverable is submitted and approved, the smart contract automatically releases the corresponding Qi tranche directly to the freelancer's wallet.

---

## 2. Peer-to-Peer Commerce & Product Sales

### The Problem
Online buyers fear non-delivery when buying items from strangers; sellers fear non-payment after shipping.

### The MoneePay Solution
Sellers generate protected escrow payment links for physical goods, digital assets, or service packages:

```
                  BUYER
                    │
               500 Qi (native)
                    │
                    ↓
           ┌─────────────────┐
           │    MoneePay     │
           │ Smart Contract  │
           │  (500 WQI held) │
           └────────┬────────┘
                    │
             Buyer confirms
                delivery
                    │
                    ↓
                 SELLER
               500 Qi (native)
```

### Workflow
1. **Listing Creation**: Seller creates a payment link (e.g. *"MacBook Pro 16 — 500 Qi"*).
2. **Escrow Lock**: Buyer deposits `500 Qi`. The contract wraps it to `500 WQI` and locks it.
3. **Protected Shipping**: Seller sees `500 Qi Secured in Escrow` and ships the item with peace of mind.
4. **Automated Settlement**: Buyer receives item, inspects it, and clicks **"Confirm Delivery"**. The contract unwraps `500 WQI` back to `500 Qi` and transfers it to the seller.
5. **Dispute Safety Net**: If non-delivery occurs, either party can open a dispute to freeze funds until arbitrated.

---

## 3. MoneePay for Teams (Corporate Payroll)

### The Problem
Companies paying international contributors or team members incur high per-transaction gas fees and manual administrative overhead.

### The MoneePay Solution
Companies can upload employee wallet addresses via CSV to disburse batch salaries, stipends, or performance bonuses in a single multi-recipient transaction:

```
[ Company Treasury ] ──Batch Payout (1,450 Qi)──> [ MoneePay Batch Disburser ] ┬──> Alice (500 Qi)
                                                  [   (95% Gas Savings)    ] ├──> Bob (350 Qi)
                                                                             ├──> Charlie (400 Qi)
                                                                             └──> Diana (200 Qi)
```

### Workflow
1. **CSV Import**: Upload `.csv` formatted with `Address, Name, Role, Amount (Qi)` or load sample team data.
2. **Live Calculation**: Review employee list, roles, and total Qi lockup sum with live inline editing.
3. **1-Click Execution**: MoneePay auto-wraps native Qi to WQI and disburses to all team wallets in a single transaction, saving up to **95% in gas fees**.
4. **Receipt Generation**: Generate verifiable payout receipts with 1-click sharing to Farcaster.

---

## 4. Quai Network Dual-Ledger Architecture (Qi & WQI)

Quai Network runs a dual-ledger architecture with two native tokens:

| Token | Ledger Type | Purpose in MoneePay |
|-------|-------------|---------------------|
| **Qi** | UTXO-based | Native medium of exchange used by buyers, sellers, and employees. |
| **Wrapped Qi (WQI)** | EVM-compatible (ERC-20) | Programmatic token held & locked inside MoneePay smart contract escrow. |

MoneePay abstracts the wrap/unwrap process behind the scenes:
$$\text{Qi (Native)} \xrightarrow{\text{Deposit}} \text{WQI (Escrow)} \xrightarrow{\text{Condition Satisfied}} \text{Qi (Recipient Wallet)}$$

---

## 5. Native Farcaster Mini App & Frame v2 Integration

MoneePay is fully optimized for **Farcaster (Warpcast)**:

- **Manifest Endpoint**: Served at `https://www.moneepay.xyz/.well-known/farcaster.json`.
- **In-Feed Frame Unfurl**: Posting any MoneePay order link on Warpcast renders an interactive **"Launch MoneePay Escrow"** frame button in the feed.
- **Save as Mini App**: Users can click **"Save as Mini App"** (`sdk.actions.addFrame()`) to pin MoneePay directly in their Warpcast Mini App launcher.
- **One-Click Cast Intent**: Share payment links, task bounties, and payroll receipts directly to Warpcast feeds.

---

## Summary Matrix

| Feature | Freelance Bounties | Product Sales | Team Payroll |
|---------|-------------------|---------------|--------------|
| **Primary User** | Solvers / Freelancers | Buyers & Sellers | Companies & Startups |
| **Trust Model** | Milestone Condition Gated | Delivery Condition Gated | Direct Batch Disburser |
| **Payout Style** | Multi-tranche releases | 1-time escrow release | Multi-recipient batch |
| **Farcaster Embed** | Share task link frame | Share checkout link frame | Share payout receipt |
