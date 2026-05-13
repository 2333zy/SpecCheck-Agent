import { notFound } from "next/navigation";
import { prisma } from "@speccheck/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";

export default async function JobPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const job = await prisma.checkJob.findFirst({ where: { id, userId: user.id }, include: { plan: true, project: true } });
  if (!job?.plan) notFound();

  const planJson = JSON.stringify(job.plan.rawPlan, null, 2);
  const rawPlan = job.plan.rawPlan as { checks?: Array<{ id: string; title: string; type: string; priority: string; expected: string }> };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Review Acceptance Plan</h1>
        <p className="mt-2 text-zinc-400">Edit the JSON plan if needed, then approve execution.</p>
      </div>
      <Card>
        <h2 className="font-semibold">{job.project.name}</h2>
        <div className="mt-4 grid gap-3">
          {(rawPlan.checks ?? []).map((check) => (
            <div key={check.id} className="rounded-md border border-zinc-800 p-3">
              <div className="flex justify-between gap-4">
                <span className="font-medium">{check.title}</span>
                <span className="text-xs text-cyan-300">{check.type} / {check.priority}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{check.expected}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <form className="grid gap-4" action={`/api/jobs/${job.id}/approve-plan`} method="post">
          <Textarea name="planJson" className="min-h-[520px] font-mono text-xs" defaultValue={planJson} />
          <Button className="w-fit">Approve and run</Button>
        </form>
      </Card>
    </div>
  );
}
