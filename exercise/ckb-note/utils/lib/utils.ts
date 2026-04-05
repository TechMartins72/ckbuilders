// src/utils/noteStorage.ts
export function hexToUtf8(hexString: string): string {
  const decoder = new TextDecoder("utf-8");
  const uint8Array = new Uint8Array(
    hexString.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16)),
  );
  return decoder.decode(uint8Array);
}
