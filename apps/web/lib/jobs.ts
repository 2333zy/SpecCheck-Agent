import path from "node:path";
import { AcceptancePlanSchema, generateMarkdownReport } from "@speccheck/core";
import { generateAcceptancePlan } from "@speccheck/agent";
import { runAcceptancePlan, startDevServer } from "@speccheck/runner";
import { Prisma, prisma } from "@speccheck/db";

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createPlannedJob(input: {
  userId: string;
  projectId: string;
  targetUrl: string;
  startCommand: string;
  requirement: string;
  options?: Record<string, unknown>;
}) {
  const project = await prisma.project.findFirstOrThrow({ where: { id: input.projectId, userId: input.userId } });
  const job = await prisma.checkJob.create({
    data: {
      userId: input.userId,
      projectId: project.id,
      status: "planning",
      targetUrl: input.targetUrl,
      startCommand: input.startCommand,
      requirement: input.requirement,
      options: toJsonInput(input.options ?? {}),
      logs: {
        create: { nodeName: "requirement_analyst", level: "info", eventType: "requirement_parsed", message: "Requirement received." },
      },
    },
  });

  let plan;
  try {
    plan = await generateAcceptancePlan({
      targetUrl: input.targetUrl,
      requirement: input.requirement,
      projectContext: [project.name, project.description, project.techStack].filter(Boolean).join("\n"),
    });
  } catch (error) {
    await prisma.agentLog.create({
      data: {
        jobId: job.id,
        nodeName: "acceptance_planner",
        level: "error",
        eventType: "plan_generation_failed",
        message: error instanceof Error ? error.message : "Plan generation failed.",
      },
    });
    await prisma.checkJob.update({ where: { id: job.id }, data: { status: "failed", finishedAt: new Date() } });
    throw error;
  }

  await prisma.acceptancePlan.create({
    data: {
      jobId: job.id,
      rawPlan: toJsonInput(plan),
      status: "draft",
    },
  });
  await prisma.agentLog.create({
    data: { jobId: job.id, nodeName: "acceptance_planner", level: "info", eventType: "plan_generated", message: `${plan.checks.length} checks generated.` },
  });
  await prisma.checkJob.update({ where: { id: job.id }, data: { status: "waiting_approval" } });
  return job.id;
}

export async function approveAndRunJob(input: { userId: string; jobId: string; planJson: string }) {
  const parsedPlan = AcceptancePlanSchema.parse(JSON.parse(input.planJson));
  const job = await prisma.checkJob.findFirstOrThrow({
    where: { id: input.jobId, userId: input.userId },
    include: { project: true, plan: true },
  });
  if (!job.plan) throw new Error("Job has no plan.");

  await prisma.acceptancePlan.update({
    where: { id: job.plan.id },
    data: { rawPlan: toJsonInput(parsedPlan), status: "approved", approvedAt: new Date() },
  });
  await prisma.checkItem.deleteMany({ where: { jobId: job.id } });
  await prisma.checkItem.createMany({
    data: parsedPlan.checks.map((item) => ({
      jobId: job.id,
      planId: job.plan!.id,
      checkKey: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      priority: item.priority,
      steps: toJsonInput(item.steps),
      expected: item.expected,
    })),
  });
  await prisma.agentLog.create({
    data: { jobId: job.id, nodeName: "human_approval", level: "info", eventType: "plan_approved", message: "User approved acceptance plan." },
  });

  const reportRoot = path.resolve(process.env.SPECHECK_REPORT_DIR || "reports");
  const reportDir = path.join(reportRoot, job.id);
  const startedAt = new Date();
  await prisma.checkJob.update({ where: { id: job.id }, data: { status: "running", startedAt } });

  let server: Awaited<ReturnType<typeof startDevServer>> | null = null;
  try {
    server = await startDevServer({
      command: job.startCommand,
      cwd: job.project.projectPath,
      url: job.targetUrl,
      timeoutMs: 30_000,
    });
    await prisma.agentLog.create({
      data: { jobId: job.id, nodeName: "dev_server", level: "info", eventType: "server_started", message: `Started ${job.startCommand}.` },
    });

    const run = await runAcceptancePlan({
      plan: parsedPlan,
      reportDir,
      trace: Boolean((job.options as { trace?: boolean } | null)?.trace),
      screenshot: true,
    });

    const checkItems = await prisma.checkItem.findMany({ where: { jobId: job.id } });
    const itemByKey = new Map(checkItems.map((item) => [item.checkKey, item]));
    for (const result of run.results) {
      const item = itemByKey.get(result.check.id);
      if (!item) continue;
      const saved = await prisma.checkResult.create({
        data: {
          jobId: job.id,
          checkItemId: item.id,
          status: result.status,
          reason: result.reason,
          actual: toJsonInput(result.actual),
          durationMs: result.durationMs,
        },
      });
      await prisma.evidence.createMany({
        data: result.evidence.map((evidence) => ({
          jobId: job.id,
          checkResultId: saved.id,
          type: evidence.type,
          filePath: evidence.filePath,
          content: evidence.content,
          metadata: evidence.metadata ? toJsonInput(evidence.metadata) : undefined,
        })),
      });
      await prisma.agentLog.create({
        data: {
          jobId: job.id,
          nodeName: "browser_executor",
          level: result.status === "passed" ? "info" : "error",
          eventType: result.status === "passed" ? "check_passed" : "check_failed",
          message: `${result.check.title}: ${result.reason}`,
        },
      });
    }

    if (run.tracePath) {
      await prisma.evidence.create({ data: { jobId: job.id, type: "trace", filePath: run.tracePath } });
    }

    const finishedAt = new Date();
    const reportInput = {
      taskName: parsedPlan.taskName,
      projectName: job.project.name,
      targetUrl: job.targetUrl,
      plan: parsedPlan,
      results: run.results.map((result) => ({
        checkId: result.check.id,
        title: result.check.title,
        status: result.status,
        reason: result.reason,
        durationMs: result.durationMs,
        evidence: result.evidence,
      })),
      agentLogs: (await prisma.agentLog.findMany({ where: { jobId: job.id }, orderBy: { createdAt: "asc" } })).map((log) => log.message),
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
    };
    const markdown = generateMarkdownReport(reportInput);
    await prisma.report.upsert({
      where: { jobId: job.id },
      create: { jobId: job.id, markdown, json: toJsonInput(reportInput) },
      update: { markdown, json: toJsonInput(reportInput) },
    });
    await prisma.agentLog.create({
      data: { jobId: job.id, nodeName: "report_writer", level: "info", eventType: "report_generated", message: "Markdown and JSON report generated." },
    });
    await prisma.checkJob.update({ where: { id: job.id }, data: { status: "completed", finishedAt } });
  } catch (error) {
    await prisma.agentLog.create({
      data: {
        jobId: job.id,
        nodeName: "supervisor",
        level: "error",
        eventType: "job_failed",
        message: error instanceof Error ? error.message : "Job failed.",
      },
    });
    await prisma.checkJob.update({ where: { id: job.id }, data: { status: "failed", finishedAt: new Date() } });
    throw error;
  } finally {
    await server?.stop();
  }
}
