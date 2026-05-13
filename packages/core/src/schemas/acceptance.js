import { z } from "zod";
export const CheckTypeSchema = z.enum([
    "element_exists",
    "text_exists",
    "form_validation",
    "interaction",
    "loading_state",
    "empty_state",
    "navigation",
    "console_error",
    "network_error",
    "visual_snapshot",
]);
export const ActionTypeSchema = z.enum([
    "goto",
    "fill",
    "click",
    "check",
    "uncheck",
    "select",
    "waitForText",
    "waitForSelector",
    "expectVisible",
    "expectText",
    "expectUrl",
    "screenshot",
]);
export const CheckStatusSchema = z.enum(["pending", "running", "passed", "failed", "skipped"]);
export const JobStatusSchema = z.enum([
    "created",
    "planning",
    "waiting_approval",
    "running",
    "diagnosing",
    "reporting",
    "completed",
    "failed",
    "canceled",
]);
export const SelectorStrategySchema = z.enum(["role", "label", "placeholder", "text", "testId", "css", "xpath"]);
export const StepSchema = z.object({
    action: ActionTypeSchema,
    target: z.string().optional(),
    value: z.string().optional(),
    timeoutMs: z.number().int().positive().max(60_000).optional(),
    expectedText: z.string().optional(),
    expectedUrl: z.string().optional(),
});
export const CheckItemSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    type: CheckTypeSchema,
    priority: z.enum(["low", "medium", "high", "critical"]),
    selectorStrategy: SelectorStrategySchema,
    steps: z.array(StepSchema).min(1),
    expected: z.string().min(1),
    failureMessage: z.string().min(1),
});
export const AcceptancePlanSchema = z.object({
    taskName: z.string().min(1),
    targetUrl: z.string().url(),
    assumptions: z.array(z.string()).default([]),
    risks: z.array(z.string()).default([]),
    checks: z.array(CheckItemSchema).min(1),
});
