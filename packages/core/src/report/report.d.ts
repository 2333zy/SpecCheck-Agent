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
export declare function summarizeReport(input: AcceptanceReportInput): {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
};
export declare function generateMarkdownReport(input: AcceptanceReportInput): string;
