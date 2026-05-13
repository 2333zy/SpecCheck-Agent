import Link from "next/link";
import { prisma } from "@speccheck/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-2 text-zinc-400">Register frontend projects for acceptance checks.</p>
      </div>
      <Card>
        <h2 className="font-semibold">New Project</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" action="/api/projects" method="post">
          <Input name="name" required placeholder="Demo login app" />
          <Input name="techStack" placeholder="Vite React" />
          <Input name="projectPath" required placeholder="C:\\path\\to\\project" />
          <Input name="defaultStartCommand" required defaultValue="pnpm dev" />
          <Input name="defaultUrl" required defaultValue="http://localhost:5173/login" />
          <Textarea className="md:col-span-2" name="description" placeholder="What this project is for" />
          <Button className="md:w-fit">Create project</Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full transition hover:border-cyan-700">
              <h2 className="font-semibold">{project.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{project.description || "No description"}</p>
              <p className="mt-4 text-xs text-zinc-500">{project.defaultUrl}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
