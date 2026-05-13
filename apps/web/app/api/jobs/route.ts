import { prisma } from "@speccheck/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  const jobs = await prisma.checkJob.findMany({
    where: { userId: user.id },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ jobs });
}
