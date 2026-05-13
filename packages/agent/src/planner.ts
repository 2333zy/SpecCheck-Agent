import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { AcceptancePlanSchema, type AcceptancePlan } from "@speccheck/core";

type PlanInput = {
  requirement: string;
  targetUrl: string;
  projectContext?: string;
};

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

function normalizeBaseUrl(baseUrl = "https://api.openai.com/v1") {
  return baseUrl.replace(/\/+$/, "");
}

function parseJsonFromText(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced?.[1] ?? trimmed);
}

async function generatePlanWithChatCompletions(input: PlanInput): Promise<AcceptancePlan> {
  const baseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "deepseek-v4-pro",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You generate JSON acceptance plans for deterministic Playwright checks.",
            "Return only valid JSON matching this shape:",
            "{ taskName: string, targetUrl: string, assumptions: string[], risks: string[], checks: Check[] }",
            "Each check must include id, title, description, type, priority, selectorStrategy, steps, expected, failureMessage.",
            "Supported check types: element_exists, text_exists, form_validation, interaction, loading_state, empty_state, navigation, console_error, network_error, visual_snapshot.",
            "Supported actions: goto, fill, click, check, uncheck, select, waitForText, waitForSelector, expectVisible, expectText, expectUrl, screenshot.",
            "Supported selectorStrategy values: role, label, placeholder, text, testId, css, xpath.",
            "Prefer label/role/text selectors. Keep steps deterministic. Do not invent unsupported actions.",
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            `Target URL: ${input.targetUrl}`,
            `Project context: ${input.projectContext || "None"}`,
            `Requirement: ${input.requirement}`,
          ].join("\n\n"),
        },
      ],
    }),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Chat completions request failed (${response.status}): ${errorText || response.statusText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Chat completions response did not include message content.");
  }

  return AcceptancePlanSchema.parse(parseJsonFromText(content));
}

export async function generateAcceptancePlan(input: PlanInput): Promise<AcceptancePlan> {
  if (!process.env.OPENAI_API_KEY) return generateMockAcceptancePlan(input);

  try {
    if (process.env.OPENAI_BASE_URL?.includes("deepseek.com")) {
      return await generatePlanWithChatCompletions(input);
    }

    const provider = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const result = await generateObject({
      model: provider(process.env.OPENAI_MODEL || "deepseek4pro"),
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
  } catch (error) {
    console.warn(
      "AI plan generation failed; falling back to deterministic mock planner.",
      error instanceof Error ? error.message : error,
    );
    return generateMockAcceptancePlan(input);
  }
}
