import { redirect } from "next/navigation";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createPlannedJob } from "@/lib/jobs";

const JobFormSchema = z.object({
  targetUrl: z.string().url(),
  startCommand: z.string().min(1),
  requirement: z.string().min(10),
  trace: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const form = await request.formData();
    const parsed = JobFormSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
    const jobId = await createPlannedJob({
      userId: user.id,
      projectId: id,
      targetUrl: parsed.data.targetUrl,
      startCommand: parsed.data.startCommand,
      requirement: parsed.data.requirement,
      options: { trace: parsed.data.trace === "on" },
    });
    redirect(`/jobs/${jobId}/plan`);
  } catch (error) {
    if (error instanceof Response) throw error;
    return jsonError(error instanceof Error ? error.message : "Failed to create acceptance job.", 500);
  }
}
