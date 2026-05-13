import type { AcceptancePlan } from "../schemas/acceptance";

export type ReportCheckResult = {
  checkId: string;
  title: string;
  status: "passed" | "failed" | "skipped";
  reason: string;
  durationMs: number;
  evidence: Array<{
    type: string;
    filePath?: string;
    content?: string;
    metadata?: Record<string, unknown>;
  }>;
};

export type AcceptanceReportInput = {
  taskName: string;
  projectName: string;
  targetUrl: string;
  plan: AcceptancePlan;
  results: ReportCheckResult[];
  agentLogs: string[];
  startedAt: string;
  finishedAt: string;
};

export function summarizeReport(input: AcceptanceReportInput) {
  const total = input.results.length;
  const passed = input.results.filter((result) => result.status === "passed").length;
  const failed = input.results.filter((result) => result.status === "failed").length;
  return {
    total,
    passed,
    failed,
    passRate: total === 0 ? 0 : Math.round((passed / total) * 100),
  };
}

export function generateMarkdownReport(input: AcceptanceReportInput): string {
  const summary = summarizeReport(input);
  const lines = [
    `# ${input.taskName}`,
    "",
    `Project: ${input.projectName}`,
    `Target URL: ${input.targetUrl}`,
    `Execution: ${input.startedAt} - ${input.finishedAt}`,
    "",
    "## Summary",
    "",
    `- Total checks: ${summary.total}`,
    `- Passed: ${summary.passed}`,
    `- Failed: ${summary.failed}`,
    `- Pass rate: ${summary.passRate}%`,
    "",
    "## Results",
    "",
  ];

  for (const result of input.results) {
    lines.push(`### ${result.status.toUpperCase()} - ${result.title}`);
    lines.push("");
    lines.push(`Reason: ${result.reason}`);
    lines.push(`Duration: ${result.durationMs}ms`);
    if (result.evidence.length > 0) {
      lines.push("Evidence:");
      for (const evidence of result.evidence) {
        lines.push(`- ${evidence.type}${evidence.filePath ? `: ${evidence.filePath}` : ""}`);
      }
    }
    lines.push("");
  }

  if (input.agentLogs.length > 0) {
    lines.push("## Agent Logs", "");
    for (const log of input.agentLogs) lines.push(`- ${log}`);
  }

  return lines.join("\n");
}
