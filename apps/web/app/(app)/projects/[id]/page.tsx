import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@speccheck/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: { jobs: { orderBy: { createdAt: "desc" }, take: 10 }, documents: true },
  });
  if (!project) notFound();

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="mt-2 text-zinc-400">{project.description}</p>
        </div>
        <Link href={`/projects/${project.id}/new-job`}>
          <Button>New acceptance job</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Project Info</h2>
          <dl className="mt-4 grid gap-2 text-sm text-zinc-300">
            <div>Stack: {project.techStack || "Not specified"}</div>
            <div>Path: {project.projectPath}</div>
            <div>Start: {project.defaultStartCommand}</div>
            <div>URL: {project.defaultUrl}</div>
          </dl>
        </Card>
        <Card>
          <h2 className="font-semibold">Documents</h2>
          <p className="mt-4 text-sm text-zinc-500">
            Knowledge-base uploads are reserved for Phase 5. Current documents: {project.documents.length}
          </p>
        </Card>
      </div>
      <Card>
        <h2 className="font-semibold">History</h2>
        <div className="mt-4 grid gap-3">
          {project.jobs.length === 0 ? (
            <p className="text-sm text-zinc-500">No jobs yet.</p>
          ) : (
            project.jobs.map((job) => (
              <Link key={job.id} className="rounded-md border border-zinc-800 p-3 hover:bg-zinc-900" href={`/jobs/${job.id}`}>
                <div className="flex justify-between">
                  <span>{job.targetUrl}</span>
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
