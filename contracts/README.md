# MoneePay Smart Contracts

**Trustless Escrow Protocol on Quai Network**

Smart contract implementations for the MoneePay escrow payment protocol, built with [Foundry](https://book.getfoundry.sh/) and targeting [Quai Network](https://qu.ai) EVM.

---

## Architecture

MoneePay implements **3 core contracts** corresponding to the protocol's 3 pillars:

| Contract | Pillar | Description |
|----------|--------|-------------|
| `MilestoneEscrow.sol` | **1 — Task Rewards** | Milestone-gated task bounties with multi-tranche releases |
| `ProductEscrow.sol` | **2 — Product Sales** | P2P commerce with delivery-condition-gated escrow |
| `BatchPayroll.sol` | **3 — Team Payroll** | Gas-optimized batch disbursement for corporate payrolls |

### Qi / WQI Dual-Ledger Flow

All contracts follow Quai Network's dual-ledger architecture:

```
Qi (Native UTXO) → deposit() → WQI (ERC-20 Escrow) → condition met → withdraw() → Qi (Recipient)
```

---

## Project Structure

```
contracts/
├── foundry.toml                    # Foundry configuration
├── remappings.txt                  # Dependency remappings
├── src/
│   ├── interfaces/
│   │   └── IWQI.sol                # Wrapped Qi ERC-20 interface
│   ├── MilestoneEscrow.sol         # Pillar 1: Task Rewards
│   ├── ProductEscrow.sol           # Pillar 2: Product Sales
│   └── BatchPayroll.sol            # Pillar 3: Batch Payroll
├── test/
│   ├── mocks/
│   │   └── MockWQI.sol             # Mock WQI token for testing
│   ├── MilestoneEscrow.t.sol       # Pillar 1 unit tests
│   ├── ProductEscrow.t.sol         # Pillar 2 unit tests
│   └── BatchPayroll.t.sol          # Pillar 3 unit tests
└── script/
    └── Deploy.s.sol                # Deployment script
```

---

## Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### Build

```bash
cd contracts
forge build
```

### Test

```bash
forge test -vvv
```

### Gas Report

```bash
forge test --gas-report
```

### Deploy

```bash
export WQI_ADDRESS=<WQI_TOKEN_ADDRESS>
forge script script/Deploy.s.sol --rpc-url <QUAI_RPC_URL> --broadcast --private-key <DEPLOYER_KEY>
```

### Deployed Addresses (Quai Orchard Testnet — Cyprus-1 Zone)

- **MockWQI**: [`0x00354572C988dB5ca96827B091a59dAea71Bfbc6`](https://orchard.quaiscan.io/address/0x00354572C988dB5ca96827B091a59dAea71Bfbc6)
- **MilestoneEscrow**: [`0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA`](https://orchard.quaiscan.io/address/0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA)
- **ProductEscrow**: [`0x0067f487e59f0C45922854F32B6d8deD8e820776`](https://orchard.quaiscan.io/address/0x0067f487e59f0C45922854F32B6d8deD8e820776)
- **BatchPayroll**: [`0x001C2F6C68d3F493FF2b9c017e334DD7685f5daB`](https://orchard.quaiscan.io/address/0x001C2F6C68d3F493FF2b9c017e334DD7685f5daB)


---

## Contract Details

### MilestoneEscrow (Pillar 1)

- **`createTask()`** — Creator locks Qi with milestone tranche allocations
- **`assignSolver()`** — Assign a solver to work on the task
- **`approveMilestone()`** — Approve deliverable, release tranche to solver
- **`openDispute()`** — Freeze remaining funds until arbitrated
- **`cancelTask()`** — Cancel and refund before solver assignment

### ProductEscrow (Pillar 2)

- **`createOrder()`** — Seller creates a product listing
- **`depositEscrow()`** — Buyer deposits exact Qi price into escrow
- **`confirmDelivery()`** — Buyer confirms receipt, funds released to seller
- **`claimTimeout()`** — Seller claims after delivery deadline expires
- **`openDispute()`** — Either party freezes funds

### BatchPayroll (Pillar 3)

- **`disburseBatch()`** — Single-tx multi-recipient payroll disbursement
- **`grantAdmin()` / `revokeAdmin()`** — RBAC treasury admin management
- **`transferOwnership()`** — Transfer contract ownership

---

## Security

- **ReentrancyGuard**: All state-changing functions with external calls are protected
- **CEI Pattern**: Checks-Effects-Interactions ordering enforced
- **Custom Errors**: Gas-efficient error handling with descriptive revert reasons
- **RBAC**: Treasury admin authorization for batch payroll execution
- **Input Validation**: Zero-address, zero-amount, array length, and percentage sum checks

---

## License

MIT
