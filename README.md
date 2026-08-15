# MoneePay

**Trustless Commerce on Quai**

> Buy with confidence. Get paid with certainty.

For a detailed breakdown of core features and platform workflows, see [Use Cases & Platform Specification](USE_CASES.md).

MoneePay is a smart-contract-powered escrow payment platform built on the [Quai Network](https://qu.ai) that lets buyers and sellers transact without requiring either party to fully trust the other. Funds are locked in a smart contract and released automatically when predefined conditions are met — no intermediary required.

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

Online commerce runs on trust, and that trust is fragile.

A buyer thinks: *"What if I pay and the seller never delivers?"*
A seller thinks: *"What if I deliver the product and the buyer refuses to pay?"*

Traditional escrow services can resolve this, but they introduce their own baggage:

- Intermediaries
- High fees
- Delays
- Manual verification
- Limited transparency
- Geographic restrictions

Blockchain offers a different path: **let the payment contract enforce the agreement.**

## The Solution

MoneePay holds a buyer's Qi (as WQI) in a smart contract until the agreed conditions are satisfied.

```
                 BUYER
                   │
              100 Qi (native)
                   │
                   ↓
            ┌──────────────┐
            │  Wrap to WQI │
            └──────┬───────┘
                   │
                   ↓
          ┌─────────────────┐
          │    MoneePay     │
          │ Smart Contract  │
          │                 │
          │  100 WQI held   │
          └────────┬────────┘
                   │
              Conditions
                satisfied
                   │
                   ↓
            ┌──────────────┐
            │ Unwrap to Qi │
            └──────┬───────┘
                   │
                   ↓
                 SELLER
               100 Qi (native)
```

The seller knows the money is secured. The buyer knows the seller can't take the funds without fulfilling the agreement.

## How It Works

### Example: Buying a Product

Alice wants to buy a laptop from Bob for 500 Qi.

**Step 1 — Bob creates an order**

```
Laptop
──────────────
Price: 500 Qi
Seller: Bob
Delivery: 7 days
```

**Step 2 — Alice pays**

Alice deposits 500 Qi into MoneePay. The platform wraps it to 500 WQI and locks it in the escrow contract.

```
Alice
  │ 500 Qi → 500 WQI
  ↓
MoneePay Escrow
  │ Funds locked
  ↓
Bob ships laptop
```

Bob can see `500 WQI secured in escrow` before he ships anything.

**Step 3 — Bob delivers**

Alice receives the laptop, confirms **Product received**, and clicks **Release Payment**. The smart contract releases the WQI, which is unwrapped back to native Qi:

```
MoneePay Escrow
    │ 500 WQI
    ↓
  Unwrap
    │ 500 Qi
    ↓
   Bob
```

### Handling Disputes

If the buyer doesn't receive the product, they can open a dispute:

```
Buyer → Dispute → MoneePay → Resolution
```

Depending on the agreed rules, the outcome is either **Refund Buyer** or **Release to Seller**. Critically, WQI stays locked in the contract the entire time a dispute is unresolved — neither party can unilaterally move it.

### Freelance Milestones

MoneePay isn't limited to physical goods. A freelancer can define a milestone-based project:

```
Website Development — Total: 500 Qi

Milestone 1  Design     100 Qi
Milestone 2  Frontend   150 Qi
Milestone 3  Backend    250 Qi
```

The client deposits the full 500 Qi upfront (wrapped to 500 WQI in escrow), and the contract releases each tranche as milestones are approved:

```
Design completed    → 100 WQI → unwrap → 100 Qi → Freelancer
Frontend completed  → 150 WQI → unwrap → 150 Qi → Freelancer
Backend completed   → 250 WQI → unwrap → 250 Qi → Freelancer
```

No manual payment chasing, no "waiting on invoice approval."

### Multi-Party Escrow

MoneePay can also support more complex splits — for example, a marketplace that automatically pays out a seller, an agent, and the platform itself:

```
          1,000 Qi (wrapped to WQI)
              │
              ↓
          ESCROW
              │
        ┌─────┼─────┐
        ↓     ↓     ↓
     Seller  Agent  Platform
     800 Qi 100 Qi  100 Qi
```

Once conditions are met, the contract distributes WQI automatically to all parties, who can unwrap back to native Qi at any time.

### Payment Links

A seller doesn't need to understand smart contracts or token wrapping to use MoneePay. They create a listing:

```
Product: MacBook Pro
Price:   500 Qi
Delivery: 7 days
```

MoneePay generates a shareable link:

```
https://moneepay.xyz/order/82hd91
```

The buyer opens it and sees a simple, protected checkout:

```
┌─────────────────────────────┐
│          MoneePay           │
│                             │
│       MacBook Pro           │
│                             │
│          500 Qi             │
│                             │
│     Protected by Escrow     │
│                             │
│      [ Pay & Escrow ]       │
└─────────────────────────────┘
```

All wrapping and unwrapping happens behind the scenes.

## Programmable Escrow

The real power of MoneePay is that escrow conditions are programmable, not fixed:

```
IF delivery confirmed     → release WQI to seller
IF deadline expires       → refund WQI to buyer
IF milestone approved     → release milestone WQI
IF dispute opened         → freeze WQI in contract
```

This turns escrow from a manual service into an automated payment protocol that any application can build on top of.

## MoneePay for Teams

Multi-party escrow doesn't have to stop at splitting one purchase between a seller, an agent, and a platform. The same "one deposit → many payout addresses" primitive scales up to something companies can use every pay cycle: **paying out Qi to their team.**

MoneePay for Teams is a company workspace layered on top of the existing escrow engine, built for recurring, condition-free payouts — as opposed to core escrow, which is built for one-off, condition-gated trades. Think of it as a distinct lifecycle for a distinct trust model: employees are already owed the money, so there's no dispute state to protect against, just a reliable, low-cost way to get it to them.

> **Scope note:** this is designed as a way for companies to pay a Qi-denominated stipend or bonus alongside normal payroll — not a replacement for a compliant, tax-withholding payroll system. That framing keeps it credible and avoids wading into employer-of-record and labor-law territory a hackathon build shouldn't try to solve.

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Solidity on Quai EVM |
| **Escrow Token** | WQI (Wrapped Qi, ERC-20) |
| **User-Facing Currency** | Qi (native UTXO) |
| **Wallet** | Pelagus Browser Extension |
| **SDK** | quais.js |
| **Frontend** | Next.js |

## License

MIT
