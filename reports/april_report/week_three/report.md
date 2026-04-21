# Builder Track Weekly Report — April Week 3

| Field           | Details        |
| --------------- | -------------- |
| **Name**        | Joseph Martins |
| **Week Ending** | April 18, 2026 |

## Key Learning

1. Rust Programming Language
   Key concepts i learnt include:

- **Ownership** — every value has a single owner, and memory is freed when the owner goes out of scope
- **Borrowing & Lifetimes** — references to data must follow strict rules to prevent dangling pointers or data races
- **No null/undefined behavior** — Rust eliminates entire classes of bugs common in C/C++

### 2. Script Basics (Rust on CKB)

Writing Rust for CKB is fundamentally different from regular Rust development because scripts do not run on a conventional OS. Instead, they execute on CKB-VM, a RISC-V virtual machine. This means:

- The standard library (std) is disabled — there is no OS to provide file I/O, threads, or heap allocation in the usual way
- Its operate in a no_std environment.
- The script's entry point is not the usual fn main().The entry! macro defines the contract entry point that CKB-VM calls when the script is executed
- Memory allocation must be explicitly configured using either default_alloc! or libc_alloc! since rust standard allocator is unavailable

### 3. Validation Model

CKB uses a UTXO-based (Cell Model) architecture where scripts serve as the validation logic for on-chain state transitions.
There are two types of scripts:

- Lock Script — controls who can unlock/spend a cell
- Type Script — controls how a cell's data can be transformed (enforces rules/logics)

When a transaction is submitted, CKB-VM executes the relevant scripts to validate whether the transaction is legitimate. A script returns 0 to indicate success and any non-zero value to indicate failure. This is the core of the validation model.

### 4. Rust SDK (ckb_std)

The ckb-std crate is CKB's standard library replacement for no_std Rust scripts. It provides everything a script needs to interact with the CKB-VM environment.
Key modules and macros are:

- high_level: High-level syscall APIs
- syscalls: Low-level CKB syscalls
- entry!: Defines the contract entry point, replacing the disabled fn main()
- default_alloc!: Sets up a simple built-in global memory allocator for no_std
- libc_alloc!: Sets up a libc-based global allocator as an alternative allocation strategy

### 5. How to Use a Makefile

A Makefile is a build automation tool that defines named targets and the commands to run them. In CKB script development, it wraps complex or repetitive commands into simple shortcuts.

## Practical Progress

### What I Learned

**CKB Validation Model**
Understanding how CKB scripts validate transactions through the Cell Model — where Lock Scripts and Type Scripts gate who can spend a cell and how its data can change.

**Writing Rust Scripts on CKB**

- Rust on CKB cannot be written like regular Rust — scripts interact with RISC-V rather than the host OS, so the standard library is inaccessible
- CKB provides its own `ckb-std` as a replacement, with `entry!` as the custom entry point and `default_alloc!` / `libc_alloc!` for heap management
  **Using a Makefile**
  Using `make` to run common development tasks like building, testing, and scaffolding new crates with variable arguments.

**The `ckb-std` Modules**

| Module           | Role                            |
| ---------------- | ------------------------------- |
| `high_level`     | High-level syscall API          |
| `syscalls`       | Low-level CKB syscalls          |
| `debug!`         | `println!`-style debug macro    |
| `entry!`         | Contract entry point definition |
| `default_alloc!` | Built-in global allocator       |
| `libc_alloc!`    | libc-based global allocator     |

**CKB-VM and RISC-V Interaction**
Understanding how CKB-VM interprets and executes RISC-V bytecode compiled from Rust scripts, and why this architecture requires a `no_std` environment.
