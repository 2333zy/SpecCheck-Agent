import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { prisma } from "@speccheck/db";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const job = await prisma.checkJob.findFirst({
    where: { id, userId: user.id },
    include: {
      project: true,
      results: { include: { checkItem: true, evidence: true }, orderBy: { createdAt: "asc" } },
      report: true,
      logs: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!job) notFound();
  const total = job.results.length;
  const passed = job.results.filter((result) => result.status === "passed").length;
  const passRate = total === 0 ? 0 : Math.round((passed / total) * 100);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">{job.project.name}</h1>
        <p className="mt-2 text-zinc-400">{job.status} · {job.targetUrl}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-zinc-400">Checks</p><p className="mt-2 text-3xl font-bold">{total}</p></Card>
        <Card><p className="text-sm text-zinc-400">Passed</p><p className="mt-2 text-3xl font-bold">{passed}</p></Card>
        <Card><p className="text-sm text-zinc-400">Pass Rate</p><p className="mt-2 text-3xl font-bold">{passRate}%</p></Card>
      </div>
      <Card>
        <h2 className="font-semibold">Execution Timeline</h2>
        <div className="mt-4 grid gap-2">
          {job.logs.map((log) => (
            <div key={log.id} className="rounded-md border border-zinc-800 p-3 text-sm">
              <span className="text-cyan-300">{log.eventType}</span>
              <span className="mx-2 text-zinc-600">/</span>
              <span className="text-zinc-300">{log.message}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">Check Results</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr><th className="py-2">Status</th><th>Check</th><th>Reason</th><th>Evidence</th></tr>
            </thead>
            <tbody>
              {job.results.map((result) => (
                <tr key={result.id} className="border-t border-zinc-800">
                  <td className="py-3 text-cyan-300">{result.status}</td>
                  <td>{result.checkItem.title}</td>
                  <td className="max-w-xl text-zinc-400">{result.reason}</td>
                  <td>{result.evidence.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">Markdown Report</h2>
        <div className="prose prose-invert mt-4 max-w-none text-sm">
          {job.report ? <ReactMarkdown>{job.report.markdown}</ReactMarkdown> : <p>No report generated yet.</p>}
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">JSON Report</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-zinc-900 p-4 text-xs text-zinc-300">
          {job.report ? JSON.stringify(job.report.json, null, 2) : "{}"}
        </pre>
      </Card>
    </div>
  );
}
