import path from "node:path";
import { chromium } from "playwright";
import type { AcceptanceCheck, AcceptancePlan } from "@speccheck/core";
import type { EvidenceRecord } from "./evidence";
import { ensureEvidenceDirs } from "./evidence";
import { runStep } from "./actions";

export type RunnerCheckResult = {
  check: AcceptanceCheck;
  status: "passed" | "failed" | "skipped";
  reason: string;
  durationMs: number;
  actual: Record<string, unknown>;
  evidence: EvidenceRecord[];
};

export async function runAcceptancePlan(options: {
  plan: AcceptancePlan;
  reportDir: string;
  trace?: boolean;
  screenshot?: boolean;
}) {
  await ensureEvidenceDirs(options.reportDir);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    networkErrors.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ""}`.trim());
  });

  if (options.trace) {
    await context.tracing.start({ screenshots: true, snapshots: true });
  }

  const results: RunnerCheckResult[] = [];
  for (const check of options.plan.checks) {
    const started = Date.now();
    const evidence: EvidenceRecord[] = [];
    try {
      for (const step of check.steps) {
        await runStep(page, check, step.action === "goto" && !step.target ? { ...step, target: options.plan.targetUrl } : step);
      }
      if (check.type === "console_error" && consoleErrors.length > 0) {
        throw new Error(consoleErrors.join("\n"));
      }
      if (check.type === "network_error" && networkErrors.length > 0) {
        throw new Error(networkErrors.join("\n"));
      }
      evidence.push({ type: "current_url", content: page.url() });
      evidence.push({ type: "dom_text", content: (await page.locator("body").innerText({ timeout: 2_000 })).slice(0, 8_000) });
      results.push({
        check,
        status: "passed",
        reason: check.expected,
        durationMs: Date.now() - started,
        actual: { url: page.url(), consoleErrors, networkErrors },
        evidence,
      });
    } catch (error) {
      if (options.screenshot !== false) {
        const filePath = path.join(options.reportDir, "screenshots", `${check.id}-${Date.now()}.png`);
        await page.screenshot({ path: filePath, fullPage: true }).catch(() => undefined);
        evidence.push({ type: "screenshot", filePath });
      }
      evidence.push({ type: "current_url", content: page.url() });
      evidence.push({ type: "console_error", content: consoleErrors.join("\n") });
      evidence.push({ type: "network_error", content: networkErrors.join("\n") });
      results.push({
        check,
        status: "failed",
        reason: error instanceof Error ? error.message : check.failureMessage,
        durationMs: Date.now() - started,
        actual: { url: page.url(), consoleErrors, networkErrors },
        evidence,
      });
    }
  }

  let tracePath: string | undefined;
  if (options.trace) {
    tracePath = path.join(options.reportDir, "traces", `trace-${Date.now()}.zip`);
    await context.tracing.stop({ path: tracePath });
  }

  await browser.close();
  return { results, tracePath };
}
