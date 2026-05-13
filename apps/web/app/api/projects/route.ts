import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@speccheck/db";
import { jsonError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";

const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  techStack: z.string().optional(),
  projectPath: z.string().min(1),
  defaultStartCommand: z.string().min(1),
  defaultUrl: z.string().url(),
});

async function readBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const parsed = await parseJson(request, ProjectSchema);
    if (!parsed.ok) return parsed;
    return parsed;
  }
  const form = await request.formData();
  const result = ProjectSchema.safeParse(Object.fromEntries(form.entries()));
  if (!result.success) return { ok: false as const, response: jsonError(result.error.issues[0]?.message ?? "Invalid input") };
  return { ok: true as const, data: result.data };
}

export async function GET() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return Response.json({ projects });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = await readBody(request);
  if (!parsed.ok) return parsed.response;
  const project = await prisma.project.create({ data: { ...parsed.data, userId: user.id } });
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    redirect(`/projects/${project.id}`);
  }
  return Response.json({ project });
}
