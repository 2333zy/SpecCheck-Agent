import { prisma } from "@speccheck/db";
import { requireUser } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const evidence = await prisma.evidence.findMany({
    where: { job: { id, userId: user.id } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ evidence });
}
