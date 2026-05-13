import type { Page } from "playwright";
import type { AcceptanceCheck, Step } from "@speccheck/core";

function locatorFor(page: Page, strategy: AcceptanceCheck["selectorStrategy"], target = "") {
  switch (strategy) {
    case "label":
      return page.getByLabel(target);
    case "placeholder":
      return page.getByPlaceholder(target);
    case "text":
      return page.getByText(target);
    case "testId":
      return page.getByTestId(target);
    case "role":
      return page.getByRole("button", { name: target });
    case "xpath":
    case "css":
    default:
      return page.locator(target);
  }
}

export async function runStep(page: Page, check: AcceptanceCheck, step: Step) {
  const timeout = step.timeoutMs ?? 5_000;
  const locator = step.target ? locatorFor(page, check.selectorStrategy, step.target) : null;

  switch (step.action) {
    case "goto":
      await page.goto(step.target || page.url(), { waitUntil: "domcontentloaded", timeout });
      return;
    case "fill":
      if (!locator) throw new Error("fill requires target");
      await locator.fill(step.value ?? "", { timeout });
      return;
    case "click":
      if (!locator) throw new Error("click requires target");
      await locator.click({ timeout });
      return;
    case "check":
      if (!locator) throw new Error("check requires target");
      await locator.check({ timeout });
      return;
    case "uncheck":
      if (!locator) throw new Error("uncheck requires target");
      await locator.uncheck({ timeout });
      return;
    case "select":
      if (!locator) throw new Error("select requires target");
      await locator.selectOption(step.value ?? "", { timeout });
      return;
    case "waitForText":
      await page.getByText(step.expectedText ?? step.target ?? "").waitFor({ state: "visible", timeout });
      return;
    case "waitForSelector":
      await page.locator(step.target ?? "").waitFor({ state: "visible", timeout });
      return;
    case "expectVisible":
      if (!locator) throw new Error("expectVisible requires target");
      await locator.waitFor({ state: "visible", timeout });
      return;
    case "expectText":
      if (!locator) throw new Error("expectText requires target");
      await locator.waitFor({ state: "visible", timeout });
      if (step.expectedText) {
        const text = await locator.textContent({ timeout });
        if (!text?.includes(step.expectedText)) throw new Error(`Expected text '${step.expectedText}', got '${text ?? ""}'`);
      }
      return;
    case "expectUrl":
      await page.waitForURL(step.expectedUrl ?? step.target ?? "", { timeout });
      return;
    case "screenshot":
      return;
  }
}
