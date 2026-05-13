import { describe, expect, it } from "vitest";
import { generateMarkdownReport } from "./report";

describe("generateMarkdownReport", () => {
  it("includes pass rate and check details", () => {
    const markdown = generateMarkdownReport({
      taskName: "Login acceptance",
      projectName: "Demo",
      targetUrl: "http://localhost:5173/login",
      startedAt: "2026-05-13T00:00:00.000Z",
      finishedAt: "2026-05-13T00:00:01.000Z",
      agentLogs: ["plan generated"],
      plan: {
        taskName: "Login acceptance",
        targetUrl: "http://localhost:5173/login",
        assumptions: [],
        risks: [],
        checks: [],
      },
      results: [
        {
          checkId: "a",
          title: "Email exists",
          status: "passed",
          reason: "Visible",
          durationMs: 10,
          evidence: [],
        },
      ],
    });

    expect(markdown).toContain("Pass rate: 100%");
    expect(markdown).toContain("Email exists");
  });
});
