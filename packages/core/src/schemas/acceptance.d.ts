import { z } from "zod";
export declare const CheckTypeSchema: z.ZodEnum<{
    element_exists: "element_exists";
    text_exists: "text_exists";
    form_validation: "form_validation";
    interaction: "interaction";
    loading_state: "loading_state";
    empty_state: "empty_state";
    navigation: "navigation";
    console_error: "console_error";
    network_error: "network_error";
    visual_snapshot: "visual_snapshot";
}>;
export declare const ActionTypeSchema: z.ZodEnum<{
    goto: "goto";
    fill: "fill";
    click: "click";
    check: "check";
    uncheck: "uncheck";
    select: "select";
    waitForText: "waitForText";
    waitForSelector: "waitForSelector";
    expectVisible: "expectVisible";
    expectText: "expectText";
    expectUrl: "expectUrl";
    screenshot: "screenshot";
}>;
export declare const CheckStatusSchema: z.ZodEnum<{
    pending: "pending";
    running: "running";
    passed: "passed";
    failed: "failed";
    skipped: "skipped";
}>;
export declare const JobStatusSchema: z.ZodEnum<{
    running: "running";
    failed: "failed";
    created: "created";
    planning: "planning";
    waiting_approval: "waiting_approval";
    diagnosing: "diagnosing";
    reporting: "reporting";
    completed: "completed";
    canceled: "canceled";
}>;
export declare const SelectorStrategySchema: z.ZodEnum<{
    role: "role";
    label: "label";
    placeholder: "placeholder";
    text: "text";
    testId: "testId";
    css: "css";
    xpath: "xpath";
}>;
export declare const StepSchema: z.ZodObject<{
    action: z.ZodEnum<{
        goto: "goto";
        fill: "fill";
        click: "click";
        check: "check";
        uncheck: "uncheck";
        select: "select";
        waitForText: "waitForText";
        waitForSelector: "waitForSelector";
        expectVisible: "expectVisible";
        expectText: "expectText";
        expectUrl: "expectUrl";
        screenshot: "screenshot";
    }>;
    target: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
    expectedText: z.ZodOptional<z.ZodString>;
    expectedUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CheckItemSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<{
        element_exists: "element_exists";
        text_exists: "text_exists";
        form_validation: "form_validation";
        interaction: "interaction";
        loading_state: "loading_state";
        empty_state: "empty_state";
        navigation: "navigation";
        console_error: "console_error";
        network_error: "network_error";
        visual_snapshot: "visual_snapshot";
    }>;
    priority: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>;
    selectorStrategy: z.ZodEnum<{
        role: "role";
        label: "label";
        placeholder: "placeholder";
        text: "text";
        testId: "testId";
        css: "css";
        xpath: "xpath";
    }>;
    steps: z.ZodArray<z.ZodObject<{
        action: z.ZodEnum<{
            goto: "goto";
            fill: "fill";
            click: "click";
            check: "check";
            uncheck: "uncheck";
            select: "select";
            waitForText: "waitForText";
            waitForSelector: "waitForSelector";
            expectVisible: "expectVisible";
            expectText: "expectText";
            expectUrl: "expectUrl";
            screenshot: "screenshot";
        }>;
        target: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodString>;
        timeoutMs: z.ZodOptional<z.ZodNumber>;
        expectedText: z.ZodOptional<z.ZodString>;
        expectedUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    expected: z.ZodString;
    failureMessage: z.ZodString;
}, z.core.$strip>;
export declare const AcceptancePlanSchema: z.ZodObject<{
    taskName: z.ZodString;
    targetUrl: z.ZodString;
    assumptions: z.ZodDefault<z.ZodArray<z.ZodString>>;
    risks: z.ZodDefault<z.ZodArray<z.ZodString>>;
    checks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        type: z.ZodEnum<{
            element_exists: "element_exists";
            text_exists: "text_exists";
            form_validation: "form_validation";
            interaction: "interaction";
            loading_state: "loading_state";
            empty_state: "empty_state";
            navigation: "navigation";
            console_error: "console_error";
            network_error: "network_error";
            visual_snapshot: "visual_snapshot";
        }>;
        priority: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>;
        selectorStrategy: z.ZodEnum<{
            role: "role";
            label: "label";
            placeholder: "placeholder";
            text: "text";
            testId: "testId";
            css: "css";
            xpath: "xpath";
        }>;
        steps: z.ZodArray<z.ZodObject<{
            action: z.ZodEnum<{
                goto: "goto";
                fill: "fill";
                click: "click";
                check: "check";
                uncheck: "uncheck";
                select: "select";
                waitForText: "waitForText";
                waitForSelector: "waitForSelector";
                expectVisible: "expectVisible";
                expectText: "expectText";
                expectUrl: "expectUrl";
                screenshot: "screenshot";
            }>;
            target: z.ZodOptional<z.ZodString>;
            value: z.ZodOptional<z.ZodString>;
            timeoutMs: z.ZodOptional<z.ZodNumber>;
            expectedText: z.ZodOptional<z.ZodString>;
            expectedUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        expected: z.ZodString;
        failureMessage: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CheckType = z.infer<typeof CheckTypeSchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export type CheckStatus = z.infer<typeof CheckStatusSchema>;
export type JobStatus = z.infer<typeof JobStatusSchema>;
export type SelectorStrategy = z.infer<typeof SelectorStrategySchema>;
export type Step = z.infer<typeof StepSchema>;
export type AcceptanceCheck = z.infer<typeof CheckItemSchema>;
export type AcceptancePlan = z.infer<typeof AcceptancePlanSchema>;
