# Builder Track Weekly Report — Week 2

| Field           | Details        |
| --------------- | -------------- |
| **Name**        | Joseph Martins |
| **Week Ending** | March 28, 2026 |

## Key Learning

- Rust Programming Language
  - Common Programming Concepts: Understanding Cargo, variables and their mutability, data types, functions, comments and control flow
  - Ownership: Understading the stack and the heap (Rust Memory Safety Model), ownership rules, scoping, memory and allocation etc.
  - Referencing and borrowing
  - Enums and Pattern Matching
  - Packages, crates and modules
- Building with JavaScript using CCC (Common Chain Connector)
- Interact and understand CKB code examples:
  - Transfer CKB
  - Store Data on Cell
  - Create Fungible Token
  - Create DOB (digital object)
  - Build a Simple Lock
  - Concept of offckb
    - The roles and conecpt of the node: which validate transactions and exposes the RPC
    - The roles and conecpt of the miner - which generated a blocks and validate transaction performed using a 'dummy worker'
  - The RPC connection flow on offckb:
  ```
  Dapp  →  Proxy (28114)  →  CKB Node (8114)
                                        ↑
                                      Miner
  ```

  - Install and understand CKB CLI

## Pratical Progress

- Clone, run and understand code examples: CKB Transfer, Store Data on Cell, Create Fungible Token, Create DOB, Build a Simple Lock.
- Explored CCC App - tried basic code on CCC playground.

## Aim for week 3

- Build an Onchain Note Storage Dapp (using Typscript with CCC) with a dashboard display - That stores a short text message inside a Cell's data field on-chain, then read it back and shows user's CKB balance when connected to thier wallet.
- Complete the Beginner part of the learner's handbook
- Complete three (3) more modules on Rust playbook
