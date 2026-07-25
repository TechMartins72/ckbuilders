# Builder Track Weekly Report — July Week 2

| Field           | Details         |
| --------------- | --------------- |
| **Name**        | Joseph Martins  |
| **Week Ending** | July 16th, 2026 |

---

## Key Learning

- Studied Fiber Network's payment channel architecture and how it enables off-chain, high-speed transactions that settle on CKB.
- Learned how the Common Chain Connector (CCC) works as a unified wallet/chain connection library for CKB dapps, and how its API differs from the older Lumos framework.
- Gained hands-on understanding of SDK design for a marketplace dapp — structuring reusable functions for storage listings, deployment, and on-chain interactions.
- Identified the key tradeoffs in migrating existing Lumos-based code to CCC, including differences in wallet connection handling and transaction building.

---

## Practical Progress

- Converted deployment and SDK code for the CKB Storage Marketplace from Lumos to CCC, updating wallet connection and transaction-building logic to match CCC's API.
- Collaborated with the fiber-dev-kit team, contributing to and extending the toolkit's developer tooling for Fiber Network.

### What I Built This Week

**On-Chain Scripts (Rust)**
Wrote four CKB lock/type scripts in Rust targeting the `riscv64imac-unknown-none-elf` architecture — `proof-verifier`, `deal-lock`, `escrow-lock`, and `collateral-lock`. These are the contracts that enforce the storage deal lifecycle on-chain. Each script reads cell data, validates Merkle proofs, and controls who can unlock funds at which point in the deal.

**Molecule Type Schemas**
Defined all shared on-chain data structures using Molecule (CKB's binary serialization format) — `DealArgs`, `ProofSubmission`, `MerkleProofItem`, and others. These schemas are the single source of truth shared between the Rust scripts and the TypeScript SDK.

**TypeScript SDK (`sdk/`)**
Built a reusable SDK with three modules:

- `transactions.ts` — functions to build `createDeal`, `submitProof`, `claimPayment`, and `slashProvider` CKB transactions using CCC
- `merkle.ts` — BLAKE2b-256 Merkle tree builder and proof verifier that mirrors the on-chain logic
- `types.ts` — shared TypeScript types (`DealCell`, `ProofSubmissionEncoded`, `MerkleProofItem`, etc.)

**Deploy Script (`scripts/deploy.ts`)**
Wrote a deployment script using CCC's `ClientPublicTestnet` and `SignerCkbPrivateKey` that compiles and deploys the four Rust binaries to CKB testnet, then writes the resulting cell outpoints to a `deployments.json` file for the SDK to consume.

**Lumos → CCC Migration**
The project originally used the deprecated Lumos framework. Replaced it entirely with `@ckb-ccc/core`. Key API changes handled:

- `cell.data` → `cell.outputData`
- `BigInt(capacity)` → `capacity` (already a bigint in CCC)
- `helpers.computeScriptHash(script)` → `ccc.hashCkb(ccc.Script.from(script).toBytes())`
- Wallet connection via `ccc.SignerCkbPrivateKey` instead of Lumos keystore

**Frontend UI (Next.js 14 + CCC Connector)**
Scaffolded the Phase 2 frontend with three working pages:

1. **Home / Provider Browser** — lists mock storage providers with search, sort (by reputation, price, availability), and summary stats. Each provider card links directly into the upload flow.

2. **Upload Wizard** — a 5-step deal-creation flow: select file → choose provider → set duration/price → confirm → done. The file step computes a SHA-256 content hash and builds a Merkle root (256 KB chunks) entirely in the browser using the Web Crypto API — no Node.js dependency required.

3. **Deals Dashboard** — wallet-gated page showing all active deals, filterable by state (pending / active / complete / slashed), with a progress bar tracking proof submissions against deal duration.

The wallet integration uses `@ckb-ccc/connector-react` (JoyID, MetaMask, OKX support), displayed as a Connect button in the navbar that shows the truncated address once connected.

---

## Current Blockers

**1. BLAKE2b in the browser**
The on-chain Merkle proof uses BLAKE2b-256, but there is no browser-native BLAKE2b implementation. The current frontend computes the Merkle root with SHA-256 (Web Crypto API) as a stand-in. This means the root shown in the UI does not match what the contract will verify. Resolving this requires either a WASM-compiled BLAKE2b package or moving the Merkle computation to a server-side API route.

**2. Rust contracts not yet deployed to testnet**
The `cargo build` for the RISC-V targets needs to be run in the `contracts/` directory with the full toolchain installed (`riscv64imac-unknown-none-elf` target + `ckb-std`). Until the binaries are compiled and deployed, there are no real script code hashes to put in `deployments.json`, so the SDK functions can't build real transactions yet.

**3. Transaction building is a UI stub**
The "Sign & Submit Deal" button in the upload wizard currently simulates a tx hash with `crypto.getRandomValues`. The real `createDeal` transaction builder in the SDK exists and is correctly structured, but it isn't wired to the frontend yet because the contract code hashes aren't available (see blocker 2).

---

## What Works vs. What Doesn't

| Feature                        | Status          | Notes                               |
| ------------------------------ | --------------- | ----------------------------------- |
| Rust contract code (logic)     | ✅ Written      | Needs compilation + testnet deploy  |
| Molecule schemas               | ✅ Complete     | Shared across Rust + TS             |
| SDK transaction builders       | ✅ Written      | Not wired to frontend yet           |
| BLAKE2b Merkle tree (Node.js)  | ✅ Works in SDK | Browser-side is SHA-256 stub        |
| Deploy script                  | ✅ Written      | Needs compiled binaries first       |
| CCC migration                  | ✅ Complete     | All Lumos code removed              |
| Provider browser UI            | ✅ Live         | Mock data; ready for real API       |
| Upload wizard UI               | ✅ Live         | Merkle root uses SHA-256 in browser |
| Deals dashboard UI             | ✅ Live         | Mock data; wallet gate works        |
| Wallet connect (CCC Connector) | ✅ Integrated   | JoyID / MetaMask / OKX              |
| Real on-chain deal submission  | ❌ Not yet      | Blocked on contract deploy          |
| Proof submission flow          | ❌ Not yet      | Phase 3 scope                       |
| Provider collateral slash      | ❌ Not yet      | Phase 3 scope                       |

---

## Major Logic That Moves the Needle

**Merkle Proof-of-Data-Possession**
The core mechanic of the whole marketplace is that a storage provider must periodically prove they still hold the file without retransmitting it. The Merkle tree built at deal creation time is committed on-chain. When a challenge fires, the provider picks a random leaf (chunk), hashes it, and submits the path up to the root. The `proof-verifier` script recomputes the root from those inputs and accepts or slashes based on the result. This week, both the TypeScript tree builder and the on-chain verifier logic were written and they share the same BLAKE2b-256 hash function — so they should agree.

**Deal State Machine (on-chain)**
The four scripts together implement a state machine: a deal starts in `pending` when the client locks escrow; it becomes `active` when the provider locks collateral; it moves to `complete` when the client calls `claimPayment` at the end of the duration; and it gets `slashed` if a challenge goes unanswered. This entire lifecycle is enforced by the CKB scripts, not by any server — the protocol is fully trustless.

**CCC SDK Layer**
By building a clean SDK on top of CCC, the frontend can eventually call a single function like `createDeal(file, provider, params)` and get back a signed CKB transaction, without knowing anything about cells, scripts, or witness encoding. That abstraction is the foundation Phase 3 will build on.

---

## Next Steps

1. **Compile and deploy contracts to testnet** — run `cargo build --release --target riscv64imac-unknown-none-elf` inside `contracts/`, then run the deploy script to get real code hashes.
2. **Wire the frontend to the real SDK** — replace the fake tx hash in the upload wizard with a real `createDeal` call using the deployed script hashes.
3. **Add a WASM BLAKE2b package** (e.g., `@noble/hashes`) to the frontend so the Merkle root shown in the UI matches the on-chain value.
4. **Build the provider-side CLI** — a Node.js script that stores the file, watches for challenges on-chain, computes the proof, and submits it.
5. **End-to-end testnet demo** — a full round trip: upload file → create deal → provider accepts → challenge fires → proof submitted → payment claimed.

---

## Useful Links

- [Screenshots](images)
- [SDKs](https://github.com/TechMartins72/ckb-storage-marketplace/tree/main/sdk)
- [UI](https://github.com/TechMartins72/ckb-storage-marketplace/tree/main/frontend)
- [Contracts](https://github.com/TechMartins72/ckb-storage-marketplace/tree/main/contracts) 