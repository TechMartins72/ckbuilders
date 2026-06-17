# Builder Track Weekly Report — April Week 3

| Field           | Details        |
| --------------- | -------------- |
| **Name**        | Joseph Martins |
| **Week Ending** | April 25, 2026 |

## Key Learning

- CKB Rust Script
- CKB VM (RISC-V)
- CKB Debugger Tool
- CKB Testtool

## Practical Progress

- I understood the nuaces between the normal Rust programming language and Rust on CKB.
- I understood that CKB Rust scripting must be done in a no `std` workspace.
- I understood that in CKB Rust, the main naming convention does not apply to it as it does in the normal rust language. The CKB Rust scripts runs on a virtual machine, which denies it access to the normal `rust std library`. So the `main` file can be defined by the `ckb_std` macro: `ckb_std::entry!`
- Memory allocation is also manually done using the macro, `ckb_std::default_alloc!` instead of depending on the heap as in Rust programming language.
- I understood the function of macros like: `debug!`, `entry!`, `defualt_alloc!` and other methods like `high_level`, and `syscalls`
- I understood that every script must have a return value. 0: which means `success` or any other integer which means `failed` or `unsuccessful`.
- I understood that CKB Rust script can be tested primarily in two different ways: using `ckb_testool` or/and `ckb_debugger`.
- `ckb-testool` is a tool that gives developer all they need to test their script in a way that simulates the real action of the script on the main blockchain. After writing a script, developer only need to run the command `cargo test`. If test command need to be dynamic, developers can pass it into a `makefile` and accept arguments to make it easier.
- `ckb_debugger` also does similar to the `ckb_testool`. Developers simply build the package (script) and run the command through the `ckb_debugger` using the command `ckb_debugger --bin [path_to_the_binary_file]`.
- The `makefile` also makes development easy. Developers can use this framework to reduce the amount of times they need to write a command on the cli to perform a particular action.
- I was able to use already provided templates by the nervos blockchain. Templates like `contract`, gives a clean template of what a normal CKB Rust script environment should look like. I used this to create a simple `Hello-world` program. [See here](./images/hello-world.png)
