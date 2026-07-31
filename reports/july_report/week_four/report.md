# Builder Track Weekly Report — July Week 4

| Field           | Details         |
| --------------- | --------------- |
| **Name**        | Joseph Martins  |
| **Week Ending** | July 31st, 2026 |

---

## Practical Progress

The last report's #1 blocker (`acceptDeal` not built) is now resolved. The full deal lifecycle from creation to acceptance is working on Aggron Testnet.

### What Changed This Week

**Recompiled and redeployed all four contracts**
The previously deployed binaries contained atomic instructions (`InvalidInstruction` on-chain). All four contracts were recompiled after switching to `ckb-std 0.14` and redeployed. New code hashes:

| Contract          | Code Hash          | Tx Hash            |
| ----------------- | ------------------ | ------------------ |
| `deal-lock`       | `0x1efc8c...8c13b` | `0xd01ea2...e7c38` |
| `escrow-lock`     | `0x14e2f2...8abe`  | `0x55275d...3d61`  |
| `proof-verifier`  | `0xe13f01...4ec58` | `0x07ef79...f10b`  |
| `collateral-lock` | `0x560b1d...2f53`  | `0x37bff1...cbffc` |

**`acceptDeal` transaction — working end-to-end**
Provider spends the pending deal cell (deal-lock `ACTION_ACCEPT`), outputs a new active deal cell (deal-lock `ACTION_PROOF`) with `state=1`, `start_epoch` set to the current CKB epoch, and all immutable fields preserved. The deal-lock contract validates the transition on-chain.

**Fixed provider lock hash mismatch**
Mock providers used a hardcoded deployer address as `testnetAddress`. The deal-lock's `is_signed_by(provider_lock_hash)` check always failed because the connected wallet's lock hash didn't match. Fixed: `createDeal` now derives `providerAddress` from `signer.getRecommendedAddress()` so the on-chain `provider_lock_hash` always matches the accepting wallet.

**Fixed three proxy bugs**

| Bug                                         | Root Cause                                                      | Fix                                                                   |
| ------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| `Id mismatched, got undefined`              | Error responses didn't include `id`                             | Extract `reqId` from body; inject into all error paths                |
| `SyntaxError: Unexpected end of JSON input` | React StrictMode aborts requests mid-flight; body arrives empty | Read body as `request.text()` first; return `{code: -32700}` on empty |
| `Proxy network error: fetch failed`         | Next.js running in WSL; Node.js can't reach external hosts      | Run `npm run dev` from PowerShell; added cause-level error logging    |

**Fixed chain indexer stale code hash**
`chainIndexer.ts` still referenced the pre-redeployment deal-lock code hash (`0xd9da77...`). Updated to `0x1efc8c...` so the dashboard finds deals created with the new contracts.

**Auto-refresh after accept**
After clicking Accept, the deal card shows a 20-second countdown and automatically re-fetches chain state, transitioning the card from Pending → Active without manual refresh.

---

## What Works vs. What Doesn't

| Feature                    | Status        | Notes                                          |
| -------------------------- | ------------- | ---------------------------------------------- |
| All 4 contracts on testnet | ✅ Redeployed | New code hashes — no more `InvalidInstruction` |
| `createDeal` transaction   | ✅ Works      | Submits real tx to testnet                     |
| `acceptDeal` transaction   | ✅ Works      | Deal transitions Pending → Active on-chain     |
| Chain indexer              | ✅ Works      | Updated to current code hash                   |
| Deals dashboard            | ✅ Works      | Auto-refresh after accept                      |
| CKB RPC proxy              | ✅ Fixed      | Id echoing, empty-body handling, WSL fix       |
| `cancelDeal` transaction   | ❌ Not built  | Next                                           |
| `submitProof` transaction  | ❌ Not built  | Next                                           |
| `closeDeal` transaction    | ❌ Not built  | Next                                           |
| Provider registration      | ❌ Not built  | Deferred                                       |
| Dashboard action buttons   | ❌ Not wired  | Cancel / Close / View Proofs                   |

---

## Next Steps

1. **`cancelDeal`** — renter cancels a pending deal; deal-lock `ACTION_CANCEL` already implemented in Rust, needs TypeScript tx builder and button.
2. **`submitProof`** — provider submits a Merkle inclusion proof; proof-verifier validates on-chain and advances `last_proof_epoch`.
3. **`closeDeal`** — either party closes a completed deal and reclaims the deal cell deposit.
4. **Wire dashboard action buttons** — Cancel, Close, View Proofs.
5. **Provider registration** — decide between on-chain registry cell (requires 5th contract) vs. localStorage-based demo approach.

---

## Useful Links

- [CKB Aggron Explorer](https://pudge.explorer.nervos.org)
- [Deployed deal-lock tx](https://pudge.explorer.nervos.org/transaction/0xd01ea24fa49bbc7e7e546a6910553e1e6da361f1bda0eb3c2565cc92d4fe7c38)
- [Deployed escrow-lock tx](https://pudge.explorer.nervos.org/transaction/0x55275d24a6e7f1a5fd988a21d6bb81ad7378b95ff885789021aa5f5e86cf3d61)
- [CKB Marketplace](https://github.com/TechMartins72/ckb-storage-marketplace)
