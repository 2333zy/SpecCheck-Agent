import { describe, expect, it } from "vitest";
import { chunkText } from "./chunk";

describe("chunkText", () => {
  it("splits text with overlap", () => {
    const chunks = chunkText("abcdefghijklmnopqrstuvwxyz", 10, 2);
    expect(chunks).toHaveLength(3);
    expect(chunks[1]?.content.startsWith("ij")).toBe(true);
  });
});
