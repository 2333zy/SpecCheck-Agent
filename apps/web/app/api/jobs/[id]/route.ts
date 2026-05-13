import { prisma } from "@speccheck/db";
import { jsonError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const job = await prisma.checkJob.findFirst({
    where: { id, userId: user.id },
    include: { project: true, plan: true, results: true, report: true },
  });
  if (!job) return jsonError("Job not found.", 404);
  return Response.json({ job });
}
