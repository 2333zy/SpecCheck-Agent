import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { AcceptancePlanSchema, type AcceptancePlan } from "@speccheck/core";

function check(id: string, title: string, target: string, type: "element_exists" | "text_exists" | "interaction", steps: AcceptancePlan["checks"][number]["steps"]) {
  return {
    id,
    title,
    description: title,
    type,
    priority: "high" as const,
    selectorStrategy: type === "text_exists" ? ("text" as const) : ("label" as const),
    steps,
    expected: `${title} should pass.`,
    failureMessage: `${title} did not meet the requirement.`,
  };
}

export function generateMockAcceptancePlan(input: { requirement: string; targetUrl: string }): AcceptancePlan {
  const lower = input.requirement.toLowerCase();
  const checks: AcceptancePlan["checks"] = [
    check("email-input", "Email input exists", "Email", "element_exists", [
      { action: "goto", target: input.targetUrl },
      { action: "expectVisible", target: "Email" },
    ]),
    check("password-input", "Password input exists", "Password", "element_exists", [
      { action: "goto", target: input.targetUrl },
      { action: "expectVisible", target: "Password" },
    ]),
    {
      ...check("login-button", "Login button exists", "Login", "element_exists", [
        { action: "goto", target: input.targetUrl },
        { action: "expectVisible", target: "Login" },
      ]),
      selectorStrategy: "role",
    },
  ];

  if (lower.includes("密码为空") || lower.includes("password")) {
    checks.push({
      id: "empty-password-validation",
      title: "Empty password shows validation",
      description: "Clicking login with an empty password should show a validation error.",
      type: "interaction",
      priority: "critical",
      selectorStrategy: "role",
      steps: [
        { action: "goto", target: input.targetUrl },
        { action: "click", target: "Login" },
        { action: "waitForText", expectedText: "密码不能为空", timeoutMs: 2_000 },
      ],
      expected: "A password-empty validation message is visible.",
      failureMessage: "No empty-password validation message was visible.",
    });
  }

  if (lower.includes("loading")) {
    checks.push({
      id: "login-loading-state",
      title: "Login button enters loading state",
      description: "Clicking login should make the button show a loading state.",
      type: "interaction",
      priority: "medium",
      selectorStrategy: "role",
      steps: [
        { action: "goto", target: input.targetUrl },
        { action: "fill", target: "Email", value: "demo@example.com" },
        { action: "fill", target: "Password", value: "secret123" },
        { action: "click", target: "Login" },
        { action: "waitForText", expectedText: "Loading", timeoutMs: 2_000 },
      ],
      expected: "A loading state is visible after login click.",
      failureMessage: "Login did not expose a loading state.",
    });
  }

  if (lower.includes("/home") || lower.includes("跳转")) {
    checks.push({
      id: "login-success-navigation",
      title: "Successful login navigates to /home",
      description: "After valid credentials are submitted, the page should navigate to /home.",
      type: "interaction",
      priority: "high",
      selectorStrategy: "role",
      steps: [
        { action: "goto", target: input.targetUrl },
        { action: "fill", target: "Email", value: "demo@example.com" },
        { action: "fill", target: "Password", value: "secret123" },
        { action: "click", target: "Login" },
        { action: "expectUrl", expectedUrl: "**/home", timeoutMs: 3_000 },
      ],
      expected: "The browser URL ends at /home.",
      failureMessage: "The login flow did not navigate to /home.",
    });
  }

  return AcceptancePlanSchema.parse({
    taskName: "Acceptance check",
    targetUrl: input.targetUrl,
    assumptions: ["Generated from the natural-language requirement and deterministic fallback planner."],
    risks: ["Selectors may need human adjustment before approval."],
    checks,
  });
}

export async function generateAcceptancePlan(input: {
  requirement: string;
  targetUrl: string;
  projectContext?: string;
}): Promise<AcceptancePlan> {
  if (!process.env.OPENAI_API_KEY) return generateMockAcceptancePlan(input);

  const provider = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  const result = await generateObject({
    model: provider(process.env.OPENAI_MODEL || "gpt-4o-mini"),
    schema: AcceptancePlanSchema,
    prompt: [
      "Convert the frontend requirement into deterministic Playwright acceptance checks.",
      "Only use supported actions and selectors. Prefer label, role, text, placeholder, or testId.",
      `Target URL: ${input.targetUrl}`,
      `Project context: ${input.projectContext || "None"}`,
      `Requirement: ${input.requirement}`,
    ].join("\n\n"),
  });

  return AcceptancePlanSchema.parse(result.object);
}
