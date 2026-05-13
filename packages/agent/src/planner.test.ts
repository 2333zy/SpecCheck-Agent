import { describe, expect, it } from "vitest";
import { generateMockAcceptancePlan } from "./planner";

describe("generateMockAcceptancePlan", () => {
  it("generates deterministic login checks", () => {
    const plan = generateMockAcceptancePlan({
      targetUrl: "http://localhost:5173/login",
      requirement: "密码为空时点击登录应该显示错误提示。点击登录后按钮应该进入 loading 状态。登录成功后应该跳转到 /home。",
    });

    expect(plan.checks.map((check) => check.id)).toEqual(
      expect.arrayContaining(["email-input", "password-input", "login-button", "empty-password-validation", "login-loading-state", "login-success-navigation"]),
    );
  });
});
