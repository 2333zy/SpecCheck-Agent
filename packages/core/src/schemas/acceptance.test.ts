import { describe, expect, it } from "vitest";
import { AcceptancePlanSchema } from "./acceptance";

describe("AcceptancePlanSchema", () => {
  it("validates a structured acceptance plan", () => {
    const plan = AcceptancePlanSchema.parse({
      taskName: "Login page",
      targetUrl: "http://localhost:5173/login",
      assumptions: [],
      risks: [],
      checks: [
        {
          id: "email-input",
          title: "Email input exists",
          description: "The login page exposes an email field.",
          type: "element_exists",
          priority: "high",
          selectorStrategy: "label",
          steps: [{ action: "goto" }, { action: "expectVisible", target: "Email" }],
          expected: "Email input is visible.",
          failureMessage: "Email input was not found.",
        },
      ],
    });

    expect(plan.checks).toHaveLength(1);
  });
});
