import { prisma } from "@speccheck/db";
import { requireUser } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const logs = await prisma.agentLog.findMany({
    where: { job: { id, userId: user.id } },
    orderBy: { createdAt: "asc" },
  });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const log of logs) {
        controller.enqueue(encoder.encode(`event: ${log.eventType}\ndata: ${JSON.stringify(log)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
