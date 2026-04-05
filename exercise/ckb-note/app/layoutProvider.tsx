"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { DEVNET_SCRIPTS } from "../utils/lib/index";
import { CSSProperties } from "react";
import React from "react";

export function LayoutProvider({ children }: { children: React.ReactNode }) {

  const defaultClient = React.useMemo(() => {
    return process.env.NETWORK === "mainnet"
      ? new ccc.ClientPublicMainnet()
      : process.env.NETWORK === "testnet"
        ? new ccc.ClientPublicTestnet()
        : new ccc.ClientPublicTestnet({
            url: "http://localhost:28114",
            scripts: DEVNET_SCRIPTS as any,
          });
  }, []);

  return (
    <ccc.Provider
      defaultClient={defaultClient}
      clientOptions={[
        {
          name: "CKB Testnet",
          client: new ccc.ClientPublicTestnet(),
        },
        {
          name: "CKB Mainnet",
          client: new ccc.ClientPublicMainnet(),
        },
        {
          name: "CKB Devnet",
          client: new ccc.ClientPublicTestnet({
            url: "http://localhost:28114",
            scripts: DEVNET_SCRIPTS as any,
          }),
        },
      ]}
    >
      {children}
    </ccc.Provider>
  );
}
