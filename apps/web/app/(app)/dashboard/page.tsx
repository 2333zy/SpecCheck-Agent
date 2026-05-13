import Link from "next/link";
import { prisma } from "@speccheck/db";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const [projectCount, jobCount, recentJobs] = await Promise.all([
    prisma.project.count({ where: { userId: user.id } }),
    prisma.checkJob.count({ where: { userId: user.id } }),
    prisma.checkJob.findMany({
      where: { userId: user.id },
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-400">Acceptance status for AI-generated frontend work.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-400">Projects</p>
          <p className="mt-2 text-3xl font-bold">{projectCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Acceptance Jobs</p>
          <p className="mt-2 text-3xl font-bold">{jobCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Pass Rate Trend</p>
          <p className="mt-2 text-3xl font-bold">Ready</p>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Jobs</h2>
          <Link className="text-sm text-cyan-300" href="/projects">
            New job
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {recentJobs.length === 0 ? (
            <p className="text-sm text-zinc-500">No acceptance jobs yet.</p>
          ) : (
            recentJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="rounded-md border border-zinc-800 p-3 hover:bg-zinc-900">
                <div className="flex justify-between gap-4">
                  <span>{job.project.name}</span>
                  <span className="text-sm text-zinc-400">{job.status}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
