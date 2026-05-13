import { notFound } from "next/navigation";
import { prisma } from "@speccheck/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";

export default async function NewJobPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) notFound();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">New Acceptance Job</h1>
        <p className="mt-2 text-zinc-400">{project.name}</p>
      </div>
      <Card>
        <form className="grid gap-4" action={`/api/projects/${project.id}/jobs`} method="post">
          <label className="grid gap-2 text-sm">
            Page URL
            <Input name="targetUrl" required defaultValue={project.defaultUrl} />
          </label>
          <label className="grid gap-2 text-sm">
            Start command
            <Input name="startCommand" required defaultValue={project.defaultStartCommand} />
          </label>
          <label className="grid gap-2 text-sm">
            Requirement
            <Textarea
              name="requirement"
              required
              defaultValue="请验收登录页面。页面应该有邮箱输入框、密码输入框和登录按钮。密码为空时点击登录应该显示错误提示。点击登录后按钮应该进入 loading 状态。登录成功后应该跳转到 /home。"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="trace" />
            Enable Playwright trace
          </label>
          <Button className="w-fit">Generate acceptance plan</Button>
        </form>
      </Card>
    </div>
  );
}
