# MoneePay

**Trustless Commerce, Task Rewards, and Corporate Payroll on Quai Network**

> Buy with confidence. Get paid with certainty.

For a detailed breakdown of core features and platform workflows, see:
- 📖 [Use Cases & Platform Specification](USE_CASES.md)
- ⚡ [Farcaster Frame v2 / Mini App Integration Guide](FARCASTER.md)

MoneePay is a smart-contract-powered escrow payment platform built on the [Quai Network](https://qu.ai) that lets buyers, sellers, freelancers, and corporations transact without requiring either party to fully trust the other. Funds are locked in a smart contract and released automatically when predefined conditions are met — no intermediary required.

---

## 🚀 Core Pillars

1. **Task Rewards & Milestone Escrows**: Project creators post tasks or bounties. Qi rewards are locked in smart escrow and released as milestones are completed.
2. **Peer-to-Peer Product Sales**: Sellers create protected escrow checkout links. Buyers deposit Qi, funds stay locked until delivery is confirmed.
3. **MoneePay for Teams (Corporate Payroll)**: Companies upload CSV payrolls to disburse batch Qi salaries and stipends to employees in a single transaction with up to 95% gas savings.
4. **Native Farcaster Mini App**: Fully integrated with Farcaster Frame v2 SDK (`@farcaster/frame-sdk`), enabling in-feed frame transactions and 1-tap launcher pinning on Warpcast.

---

## Architecture Note

Quai Network runs a **dual-ledger architecture** with two native tokens:

| Token | Ledger | Purpose |
|-------|--------|---------|
| **QUAI** | Account-based (EVM) | Programmable, deflationary store of value |
| **Qi** | UTXO-based | Stable, energy-backed medium of exchange |

Because Qi lives on a UTXO ledger (like Bitcoin), it cannot be used directly inside EVM smart contracts. Quai solves this with **Wrapped Qi (WQI)** — an ERC-20 representation of Qi on the EVM side.

**MoneePay's escrow contracts operate on the EVM-compatible Quai ledger using WQI.** From the user's perspective, the experience is seamless: deposit Qi → it's wrapped into WQI → held in escrow → released as WQI → unwrap back to Qi. The frontend abstracts the wrap/unwrap step so users simply "pay in Qi."

---

## The Problem

Online commerce and remote work run on trust, and that trust is fragile:

- A buyer thinks: *"What if I pay and the seller never delivers?"*
- A seller thinks: *"What if I deliver the product/service and the buyer refuses to pay?"*
- A freelancer thinks: *"What if I finish the task and the client ghost me?"*

Traditional escrow services can resolve this, but introduce high fees, manual verification, and delays. Blockchain offers a better path: **let the smart contract enforce the agreement.**

---

## The Solution

MoneePay holds funds (as WQI) in a smart contract until agreed conditions are satisfied.

```
                 BUYER / CREATOR
                        │
                  100 Qi (native)
                        │
                        ↓
               ┌─────────────────┐
               │   Wrap to WQI   │
               └────────┬────────┘
                        │
                        ↓
             ┌─────────────────────┐
             │      MoneePay       │
             │   Smart Contract    │
             │    100 WQI held     │
             └──────────┬──────────┘
                        │
                   Conditions
                    satisfied
                        │
                        ↓
               ┌─────────────────┐
               │  Unwrap to Qi   │
               └────────┬────────┘
                        │
                        ↓
                 SELLER / SOLVER
                  100 Qi (native)
```

The seller/solver knows the money is secured upfront. The buyer/creator knows funds cannot be claimed without fulfilling the agreement.

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Solidity on Quai EVM |
| **Escrow Token** | WQI (Wrapped Qi, ERC-20) |
| **User-Facing Currency** | Qi (native UTXO) |
| **Farcaster SDK** | `@farcaster/frame-sdk` |
| **Wallet** | Pelagus Browser Extension |
| **Frontend** | Next.js (App Router) |

---

## 📜 Deployed Smart Contracts (Quai Network Orchard Testnet — Cyprus-1)

| Contract | Pillar / Description | Address | Explorer Link |
|----------|----------------------|---------|---------------|
| `MockWQI.sol` | **Wrapped Qi ERC-20 Token** | `0x00384B879c117052527B3C93c1ab8525348dF64A` | [View on Quaiscan](https://orchard.quaiscan.io/address/0x00384B879c117052527B3C93c1ab8525348dF64A) |
| `MilestoneEscrow.sol` | **Pillar 1 — Task Rewards** | `0x005e75c2F2cCD9205f498A5D0792561A989D9851` | [View on Quaiscan](https://orchard.quaiscan.io/address/0x005e75c2F2cCD9205f498A5D0792561A989D9851) |
| `ProductEscrow.sol` | **Pillar 2 — Product Sales** | `0x006f02062876B24b138Ce56Ef6268Edad6d0CAa6` | [View on Quaiscan](https://orchard.quaiscan.io/address/0x006f02062876B24b138Ce56Ef6268Edad6d0CAa6) |
| `BatchPayroll.sol` | **Pillar 3 — Team Payroll** | `0x006af39747bD49a5278610C274Ba96B013D07EE3` | [View on Quaiscan](https://orchard.quaiscan.io/address/0x006af39747bD49a5278610C274Ba96B013D07EE3) |



---

## License

MIT

