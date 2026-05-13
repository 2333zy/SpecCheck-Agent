import { describe, expect, it } from "vitest";
import { validateStartCommand } from "./commands";

describe("validateStartCommand", () => {
  it("allows configured dev commands", () => {
    expect(validateStartCommand("pnpm dev").ok).toBe(true);
  });

  it("blocks dangerous commands", () => {
    const result = validateStartCommand("rm -rf .", ["rm -rf ."]);
    expect(result.ok).toBe(false);
  });

  it("blocks shell chaining", () => {
    const result = validateStartCommand("npm run dev && del package.json");
    expect(result.ok).toBe(false);
  });
});
