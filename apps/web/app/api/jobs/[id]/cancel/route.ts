import { prisma } from "@speccheck/db";
import { requireUser } from "@/lib/auth";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.checkJob.update({ where: { id, userId: user.id }, data: { status: "canceled", finishedAt: new Date() } });
  return Response.json({ ok: true });
}
