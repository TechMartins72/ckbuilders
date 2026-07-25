# Builder Track Weekly Report — July Week 3

| Field           | Details         |
| --------------- | --------------- |
| **Name**        | Joseph Martins  |
| **Week Ending** | July 24th, 2026 |

---

## Key Learning

- **CKB's cell model runs type scripts on BOTH creation and consumption.** This is the single most important thing I understood this week. When you attach a type script to a cell in the outputs of a transaction, that script runs immediately — even though the cell is being created, not spent. This caused a hard-to-debug `ScriptNotFound` failure: the proof-verifier was attached to the deal cell at creation time, but it immediately tried to read an active deal from `Source::Input`, which didn't exist yet. The fix was architectural: don't attach the type script until `acceptDeal`, when there actually is an input deal cell to validate against.

- **BLAKE2b has a personalization parameter that SHA-256 doesn't.** CKB uses BLAKE2b-256 with a 16-byte personalization string `"ckb-default-hash"`. If you use generic BLAKE2b without it, your hashes won't match what the chain produces. The `@noble/hashes` library exposes this as `{ dkLen: 32, personalization: new TextEncoder().encode("ckb-default-hash") }`.

- **Browser JavaScript has no `Buffer`.** Everything that worked fine in the deploy scripts (Node.js) broke in the browser component. Learned to use `DataView` + `Uint8Array` for all binary encoding, and to avoid any package that depends on Node's `Buffer`. This affected both the 173-byte Molecule encoding of `DealParams` and the Merkle tree computation.

- **CORS blocks direct browser → CKB node calls.** The CKB testnet node at `testnet.ckb.dev` does not send `Access-Control-Allow-Origin` headers, so any browser `fetch()` to it gets blocked. The standard fix is a server-side proxy. A single Next.js API route (`/api/ckb-rpc`) forwarding POST requests server-side resolved the entire class of "Failed to fetch" errors.

- **`useCcc()` in CCC Connector v1.x does not return `signer` directly.** The hook returns `{ signerInfo?, client, open, ... }`. The signer lives at `signerInfo?.signer`. This is a subtle API difference from earlier versions and caused TypeScript errors in three separate files before the pattern was properly applied everywhere.

- **`cellDeps` only matter when a script actually runs.** Lock scripts on cells only run when those cells are spent (input side). So when creating a deal cell, the deal-lock and escrow-lock scripts do NOT run — only the renter's existing secp256k1 lock runs (to authorize spending the input UTXOs). This means no custom `cellDeps` are needed in `createDeal`, which simplifies the transaction considerably.

---

## Practical Progress

All three blockers from the previous report are now resolved. The full path from "upload file in the browser" to "deal cell confirmed on CKB testnet" is working end-to-end.

### What I Built This Week

**Real BLAKE2b Merkle Root in the Browser**
Replaced the SHA-256 stub Merkle computation (last week's blocker #1) with a real BLAKE2b-256 implementation using `@noble/hashes/blake2b`. The file is chunked into 256 KB pieces, each chunk is hashed, and the hashes are reduced into a binary Merkle tree. Every hash uses the CKB personalization string `"ckb-default-hash"` so the root matches exactly what the on-chain `proof-verifier` script will verify. This all runs in the browser — no server round-trip, no WASM loader, pure JavaScript.

**Compiled All Four Rust Contracts**
Successfully compiled `proof-verifier`, `deal-lock`, `escrow-lock`, and `collateral-lock` to the `riscv64imac-unknown-none-elf` target. This was last week's blocker #2.

**Deployed All Four Contracts to CKB Aggron Testnet**
All four scripts are now live on testnet with real code hashes:

| Contract          | Code Hash          |
| ----------------- | ------------------ |
| `deal-lock`       | `0xd9da77...1d658` |
| `escrow-lock`     | `0xd561bc...49079` |
| `proof-verifier`  | `0xdf912b...d1a26` |
| `collateral-lock` | `0xadc579...570dc` |

The deploy required approximately 79,532 CKB from the Aggron faucet (multiple claims across sessions). The code hashes are written to `deployments.json` and `sdk/src/config/testnet.ts`.

**`scripts/finalize-deployment.ts`**
A script that reads each compiled binary, computes its BLAKE2b-256 code hash using `ccc.hashCkb`, pairs it with the deploy transaction hash and output index, and writes the final `deployments.json` and testnet config file. Without this script, code hashes had to be computed manually.

**`frontend/lib/ckbTransactions.ts` — Real `createDeal` Transaction**
A browser-compatible transaction builder. Key design decisions:

- All binary encoding uses `DataView` + `Uint8Array` (no `Buffer`)
- `DealParams` is encoded as a 173-byte Molecule binary with little-endian u64 fields at specific offsets
- The deal cell has **no type script** at creation (see the type script paradox below)
- The escrow cell uses `00...00` (32 zero bytes) as a placeholder `dealTypeHash`; this is replaced in `acceptDeal` when the deal goes active
- CCC handles UTXO collection and fee estimation automatically via `completeInputsByCapacity` and `completeFeeChangeToLock`

This replaced the fake tx hash (last week's blocker #3).

**`frontend/lib/chainIndexer.ts` — On-Chain Deal Reader**
Reads live deal cells directly from CKB testnet without a separate indexer service. Uses CCC's async generator `client.findCells({ script, scriptType: "lock", scriptSearchMode: "prefix" })` — the deal-lock args start with the renter's lock hash (32 bytes), so all of a given renter's deals share a common prefix that can be searched efficiently. Each cell's 173-byte `outputData` is decoded back into a `ChainDeal` object using `DataView`. Derived fields (estimated escrow balance, next challenge epoch, proof count) are computed from the raw Molecule fields.

**Deals Dashboard Rewrite (`frontend/app/deals/page.tsx`)**
Replaced all mock data with real on-chain deal cells. The page now:

- Waits for wallet connection, then fetches deals from the chain
- Shows a loading skeleton while fetching
- Decodes each deal cell and renders state (Pending / Active / Complete / Slashed) with a progress bar for active deals
- Provides a "View on Explorer →" link to the Nervos Pudge explorer for each deal
- Has a manual refresh button

**CKB RPC Proxy (`app/api/ckb-rpc/route.ts`)**
A single Next.js API route that proxies all CKB JSON-RPC calls from the browser to `https://testnet.ckb.dev/rpc`. The browser calls `/api/ckb-rpc`; the Next.js server forwards it to the testnet node and returns the response. Since the server-side `fetch` is not subject to CORS restrictions, this eliminates the entire class of "Failed to fetch" errors when calling the CKB node from browser code. The `Provider` component is now configured with `defaultClient={new ccc.ClientPublicTestnet({ url: "/api/ckb-rpc" })}`.

---

## What Works vs. What Doesn't

| Feature                       | Status       | Notes                                     |
| ----------------------------- | ------------ | ----------------------------------------- |
| Rust contracts (logic)        | ✅ Complete  | Compiled + deployed to Aggron             |
| All 4 contracts on testnet    | ✅ Live      | Real code hashes in `deployments.json`    |
| BLAKE2b Merkle root (browser) | ✅ Works     | Uses `@noble/hashes`, CKB personalization |
| `createDeal` transaction      | ✅ Works     | Submits real tx to testnet                |
| Chain indexer                 | ✅ Works     | Reads live deal cells                     |
| Deals dashboard (real data)   | ✅ Works     | Decodes 173-byte Molecule binary          |
| CKB RPC proxy (CORS fix)      | ✅ Works     | All RPC via `/api/ckb-rpc`                |
| CCC Connector (wallet)        | ✅ Works     | JoyID / MetaMask / OKX                    |
| Provider browser UI           | ✅ Live      | Still mock provider data                  |
| `acceptDeal` transaction      | ❌ Not built | Phase 3 — deals stuck in Pending          |
| `submitProof` transaction     | ❌ Not built | Phase 3                                   |
| `closeDeal` transaction       | ❌ Not built | Phase 3                                   |
| Provider registration         | ❌ Not built | Deferred                                  |
| Dashboard action buttons      | ❌ Not wired | Cancel / Close / View Proofs              |
| Provider-side CLI watcher     | ❌ Not built | Phase 3                                   |

---

## Major Logic That Moves the Needle

**The Type Script Paradox (and how we solved it)**
In CKB, a type script runs whenever its cell appears in a transaction — as an input (spending) OR as an output (creation). This is by design: type scripts can enforce invariants on what's written into a new cell. But it created a hard problem for us: the proof-verifier is supposed to validate that a storage proof is correct, reading the deal cell from `Source::Input`. If we attach it at creation, it runs with no input deal cell and immediately errors. The solution is to separate concerns by phase: the deal cell is born with only a lock script (deal-lock, which only runs on spending), and the type script is introduced at the exact moment the deal goes active — in `acceptDeal`. This mirrors how real CKB protocols (like Nervos DAO) defer type script constraints to the appropriate lifecycle phase.

**Molecule Encoding Without Node.js**
The 173-byte `DealParams` struct is encoded in a precise layout that the Rust contracts parse field-by-field at specific byte offsets. In Node.js you'd use `Buffer.writeUInt32LE`. In the browser, `Buffer` doesn't exist. The solution: `DataView.setUint32(offset, value, true)` for 4-byte little-endian integers, and manually splitting 64-bit values across two 32-bit writes (since JavaScript `DataView` doesn't support `BigInt64` in all environments). Every field offset was validated against the Rust struct layout to ensure binary compatibility.

**Prefix Search as a Poor-Man's Indexer**
The CKB Indexer RPC supports prefix matching on lock/type script args. Since the deal-lock args start with the renter's lock hash (32 bytes), all deals for a given renter share a predictable 32-byte prefix. A single `findCells` call with that prefix finds every deal for the connected wallet with no separate database, no event log, and no off-chain service. This is the CKB-native way to query "what cells belong to me."

---

## Current Blockers

**1. `acceptDeal` not yet built**
The critical missing piece. Until a provider accepts a deal, it stays in `Pending` forever. The escrow is locked but no storage is happening. `acceptDeal` is the most complex transaction in the protocol because it needs to compute the deal cell's type hash (which requires knowing the outpoint from `createDeal`), attach the proof-verifier with that type hash, and update the escrow cell's args to replace the zero placeholder with the real deal type hash — all in a single atomic transaction.

**2. Provider registration system not built**
The home page still shows mock providers. There's no on-chain mechanism for a provider to announce themselves, their price, or their capacity. This is a separate design problem: registration could be a dedicated cell type, or it could live off-chain in a simple API, or it could be a signed announcement stored in a CKB transaction's witness. Architecture decision still open.

**3. No provider-side tooling**
Providers need a CLI or daemon that: watches for deals addressed to them, accepts deals, stores the file, watches for challenge epochs, computes Merkle proofs, and submits them before the slash window closes. None of this exists yet.

---

## Next Steps

1. **Build `acceptDeal`** — provider accepts a pending deal: attaches proof-verifier type script to the deal cell, updates escrow with real `dealTypeHash`, sets deal state to Active. This unlocks the entire rest of the protocol.
2. **Build `submitProof`** — provider submits a Merkle proof witness; proof-verifier validates it on-chain and releases `pricePerEpoch` from escrow to provider.
3. **Build `closeDeal`** — either party closes a completed deal and retrieves the 234 CKB deposit locked in the deal cell.
4. **Wire dashboard action buttons** — the Cancel, Close, and View Proofs buttons in the deals dashboard need to call the above transaction builders.
5. **Provider registration design** — decide between on-chain cell, off-chain API, or signed witness announcement. Build accordingly.
6. **End-to-end testnet demo** — full lifecycle: upload → create deal → provider accepts → proof submitted → payment released.

---

## Useful Links

- [CKB Aggron Explorer](https://pudge.explorer.nervos.org)
- [Deployed deal-lock tx](https://pudge.explorer.nervos.org/transaction/0xda08b68798a1edb8ba2ca23e12ca2d41f8e61538ab6b803c71d36d35346fd887)
- [Deployed escrow-lock tx](https://pudge.explorer.nervos.org/transaction/0xa7a2ebc96febc3b20955fb8084a6041ef35f8ba7efaebf9e8c435c473721b08e)
- [Deployed proof-verifier tx](https://pudge.explorer.nervos.org/transaction/0x8811980eefcf0e979625a3cd2d870bb440b068f1e4f085276cb667aac378fd27)
- [Deployed collateral-lock tx](https://pudge.explorer.nervos.org/transaction/0x651aa133dfa7051d59b092b419466ea9e9febb2186f56a0edf74abbfa661e081)
- [CKB Marketplace](https://github.com/TechMartins72/ckb-storage-marketplace)
