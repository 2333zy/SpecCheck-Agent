import { redirect } from "next/navigation";
import { jsonError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { approveAndRunJob } from "@/lib/jobs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const form = await request.formData();
  const planJson = String(form.get("planJson") ?? "");
  if (!planJson) return jsonError("Plan JSON is required.");
  await approveAndRunJob({ userId: user.id, jobId: id, planJson });
  redirect(`/jobs/${id}`);
}
