"use client";

import { FaWallet } from "react-icons/fa";
import ConnectWallet from "@/components/ConnectWallet";
import React, { useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import EncryptDecryptToggle from "@/components/Toggle";

export type Mode = "encrypt" | "decrypt";

export default function Home() {
  const [noteText, setNoteText] = React.useState("");
  const [hashText, setHashText] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const [notes, setNotes] = React.useState<
    { message: string; txHash: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = useState<Mode>("encrypt");
  const signer = ccc.useSigner();

  return (
    <div className="w-full h-screen flex flex-col items-center text-center">
      <header className="w-screen border-b border-gray-700">
        <div className="w-full max-w-6xl flex items-center justify-between mx-auto py-6">
          <h1>📝 OnChain Note Storage</h1>
          <ConnectWallet />
        </div>
      </header>
      <div className="flex-1 w-full max-w-6xl mx-auto p-4">
        {signer && (
          <div className="mx-auto w-fit pt-6">
            <EncryptDecryptToggle mode={mode} setMode={setMode} />
          </div>
        )}
        {signer ? (
          mode === "encrypt" ? (
            <div className="w-full h-full mt-32">
              <div className="w-full h-full flex items-center flex-col gap-4">
                <h2 className="text-2xl mb-4">
                  {mode === "encrypt"
                    ? "Store a Note On-Chain"
                    : "Retrieve a Note"}
                </h2>
                <textarea
                  rows={4}
                  style={{ width: "100%" }}
                  placeholder="Type your message..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="outline-none w-full max-w-4xl bg-transparent border-2 border-gray-700 rounded-md p-4 text-left"
                />
                <button disabled={loading} className="button">
                  {loading ? "Storing..." : "Store on CKB"}
                </button>
                {txHash && (
                  <p>
                    ✅ Stored! Tx:{" "}
                    <a
                      href={`https://testnet.explorer.nervos.org/transaction/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {txHash.slice(0, 20)}...
                    </a>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full mt-32">
              <div className="w-full h-full flex items-center flex-col gap-4">
                <h2 className="text-2xl mb-4">Retrieve a Note Onchain</h2>
                <input
                  placeholder="Enter hash..."
                  value={hashText}
                  onChange={(e) => setHashText(e.target.value)}
                  className="outline-none w-full max-w-4xl bg-transparent border-2 border-gray-700 rounded-md p-4 text-left"
                />
                <button disabled={loading} className="button">
                  {loading ? "Retrieving..." : "Retrieve Note"}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
            <div className="w-16 h-16 mb-2 rounded-full bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 flex items-center justify-center text-white">
              <span aria-hidden="true">
                <FaWallet className="text-3xl" />
              </span>
            </div>
            <h2 className="text-2xl">
              Please connect your wallet to store notes on-chain.
            </h2>
          </div>
        )}
      </div>
      <footer className="w-screen border-t border-gray-700">
        <div className="w-full max-w-6xl flex justify-center items-center mx-auto py-6 ">
          <h3>Powered by Nervos CKB</h3>
        </div>
      </footer>
    </div>
  );
}
