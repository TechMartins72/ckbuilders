# Builder Track Weekly Report — May Week 3

| Field           | Details        |
| --------------- | -------------- |
| **Name**        | Joseph Martins |
| **Week Ending** | May 16, 2026   |

## Key Learning

- How to build an hash lock - using Rust script
- How to deploy script's binary on CKB testnet
- How to create as cell that uses a user deployed lock hash as it lock hash
- How to consume - as an input - a cell that uses a user deployed hash lock
- Error code and debugging
- Understanding the concept of Molecular Serialization
- CKB-VM Deep Dive

## Practical Progress

- Build an hash lock with Rust script - [Repo](./images/lock_script_rust_code_snippet.png)
- Deployed the hash lock on the CKB testnet using CCC with ts - [SS](./images/confirm_deployement.png)
- Created a cell that uses the deployed hashlock as its haslock - [SS](./images/successful_create_locked_cell_transaction.png)
- Consumed the cell - as an input - that uses the hash lock - with error - [SS](./images/consume_locked_cell_error.png)

## Blockers

- Error code: The script compiles successfully. Using CCC, I was able to deploy the binary on to CKB testnet. I also successfully created a cell that uses the hash lock but an error that occurs when I try to consume the cell - as an input - for a transaction.
  [See error](./images/consume_locked_cell_error.png)

## Plan for Week 4

- Learn Debugging and Testing: to get better understanding of CKB's error - VM's error and Script's error - and to be able to fix the Hash Lock error.
- Fix Hash Lock error code(s)

## Useful links

- [Screenshots](images)
- [Hash Lock Script](https://github.com/TechMartins72/ckb-tutorials/tree/main/rust-scripts/hash-lock-scripts)
