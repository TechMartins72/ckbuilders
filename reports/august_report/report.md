# Builder Track Weekly Report — August Week 1

| Field           | Details        |
| --------------- | -------------- |
| **Name**        | Joseph Martins |
| **Week Ending** | August 7, 2026 |

---

## Practical Progress

### cancelDeal

The deal-lock contract was redesigned from scratch. The action byte was removed entirely — args are now 64 bytes (renter + provider lock hash only). The action is inferred from transaction context, which means a single pending deal cell can now be either cancelled or accepted depending on who signs and what outputs are present. The new contract was compiled and the frontend `cancelDeal` function was implemented. A Cancel button appears on pending deals for the wallet that created them.

### Provider Registry (5th contract)

A new `provider-registry` type script was written, compiled, and deployed to Aggron Testnet. It is a tag-only contract — always returns 0. Providers register by creating a cell with this type script and their own wallet lock. The cell data is compact JSON containing: name, endpoint URL, location, CKB address, price per epoch, available storage (GB), and uptime %.

The deploy script was updated to include the new contract.

**What is real:** the contract is deployed, registration and deregistration are real on-chain transactions, and the registry is queryable by any client.

**What is dummy / self-reported:** name, location, available GB, and uptime % are entered by the provider and stored as-is — there is no on-chain verification. The endpoint URL is stored but nothing calls it yet (it becomes active when `submitProof` is implemented).

### Homepage and Upload flow

The homepage and provider-selection step in the upload wizard now load providers live from the chain instead of the hardcoded mock list. Registering via `/providers/register` causes the new provider to appear on the homepage after the next block confirms.

---

## What Works vs. What Doesn't

| Feature                          | Status           | Notes                                                            |
| -------------------------------- | ---------------- | ---------------------------------------------------------------- |
| `createDeal` transaction         | ✅ Works         | Real testnet tx                                                  |
| `acceptDeal` transaction         | ✅ Works         | Real testnet tx                                                  |
| `cancelDeal` transaction         | ✅ Works (new)   | Renter cancels pending deal; 234 CKB returned                    |
| Provider registration on-chain   | ✅ Works (new)   | Real tx; cell queryable by any client                            |
| Provider deregistration          | ✅ Works (new)   | Spends registry cell; CKB returned to provider                   |
| Homepage — live provider list    | ✅ Works (new)   | Loaded from chain; no more mock data                             |
| Upload — provider selection      | ✅ Works (new)   | Shows chain providers; uses registered address for deal creation |
| Auto-refresh after accept/cancel | ✅ Works         | 20s countdown then re-fetches                                    |
| Provider metadata                | ⚠️ Self-reported | Name, GB, uptime not verified on-chain                           |
| Provider endpoint URL            | ⚠️ Stored only   | Not called — becomes active with `submitProof`                   |
| `submitProof` transaction        | ❌ Not built     | Provider proves file possession; advances `last_proof_epoch`     |
| `closeDeal` transaction          | ❌ Not built     | Either party reclaims deal cell deposit after completion         |
| Escrow payment release           | ❌ Not built     | CKB locked in escrow cell; no release mechanism yet              |
| Collateral slashing              | ❌ Not built     | `collateral-lock` deployed but slash logic not wired to frontend |
| Provider HTTP server             | ❌ Not built     | The actual file storage and proof-generation server              |

---

## Next Steps

1. **`submitProof`** — provider submits a Merkle inclusion proof on-chain; proof-verifier validates it and `last_proof_epoch` advances.
2. **`closeDeal`** — either party closes a completed deal and reclaims the 234 CKB deal cell deposit.
3. **Provider HTTP server** — a minimal Node.js server with `/upload` and `/proof/:dealId` routes; required before `submitProof` can be tested end-to-end.
4. **Escrow payment release** — mechanism for the provider to claim earned CKB from the escrow cell.

---

## Useful Links

- [CKB Aggron Explorer](https://pudge.explorer.nervos.org)
- [provider-registry tx](https://pudge.explorer.nervos.org/transaction/0xb798913c8980ebb118dd77ad585125636673a375c8a8a0dce1ac08781eb88a4d)
- [deal-lock tx](https://pudge.explorer.nervos.org/transaction/0x58c4e9a883afc59cbf083dcdbd083c857da86dddd733b94451d8a59091f00a94)
- [CKB Marketplace Repo](https://github.com/TechMartins72/ckb-storage-marketplace)
