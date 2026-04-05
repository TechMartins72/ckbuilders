"use client";

import React, { useState } from "react";
import { Mode } from "@/app/page";

const EncryptDecryptToggle = ({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}) => {
  return (
    <div className="flex items-center gap-0 rounded-lg border border-gray-300 w-fit overflow-hidden">
      <button
        onClick={() => setMode("encrypt")}
        className={`px-5 py-2 text-sm font-medium transition-colors
          ${
            mode === "encrypt"
              ? "bg-white text-gray-900 font-bold"
              : "bg-gray-900 text-gray-400 transition-all duration-150 hover:text-white"
          }`}
      >
        Encrypt
      </button>

      <div className="w-px h-6 bg-gray-300" />

      <button
        onClick={() => setMode("decrypt")}
        className={`px-5 py-2 text-sm font-medium transition-colors
          ${
            mode === "decrypt"
              ? "bg-white text-gray-900 font-bold"
              : "bg-gray-900 text-gray-400 hover:text-white transition-all duration-150"
          }`}
      >
        Decrypt
      </button>
    </div>
  );
};

export default EncryptDecryptToggle;
