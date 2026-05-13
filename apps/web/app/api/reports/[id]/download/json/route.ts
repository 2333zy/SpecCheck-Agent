import { prisma } from "@speccheck/db";
import { jsonError } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const report = await prisma.report.findFirst({ where: { id, job: { userId: user.id } } });
  if (!report) return jsonError("Report not found.", 404);
  return new Response(JSON.stringify(report.json, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="speccheck-${id}.json"`,
    },
  });
}
