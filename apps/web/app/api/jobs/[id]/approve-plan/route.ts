import { jsonError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { approveAndRunJob } from "@/lib/jobs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const form = await request.formData();
    const planJson = String(form.get("planJson") ?? "");
    if (!planJson) return jsonError("Plan JSON is required.");
    await approveAndRunJob({ userId: user.id, jobId: id, planJson }).catch((error) => {
      console.error("Acceptance job failed.", error);
    });
    return Response.redirect(new URL(`/jobs/${id}`, request.url), 303);
  } catch (error) {
    if (error instanceof Response) throw error;
    return jsonError(error instanceof Error ? error.message : "Failed to run acceptance job.", 500);
  }
}
