import { z } from "zod";
import { prisma } from "@speccheck/db";
import { jsonError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";

const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  techStack: z.string().optional(),
  projectPath: z.string().min(1).optional(),
  defaultStartCommand: z.string().min(1).optional(),
  defaultUrl: z.string().url().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return jsonError("Project not found.", 404);
  return Response.json({ project });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const parsed = await parseJson(request, UpdateProjectSchema);
  if (!parsed.ok) return parsed.response;
  const project = await prisma.project.update({ where: { id, userId: user.id }, data: parsed.data });
  return Response.json({ project });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.project.delete({ where: { id, userId: user.id } });
  return Response.json({ ok: true });
}
