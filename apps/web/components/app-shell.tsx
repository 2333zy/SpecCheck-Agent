import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-800 bg-zinc-950 p-6 md:block">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          SpecCheck Agent
        </Link>
        <nav className="mt-8 grid gap-2 text-sm text-zinc-300">
          <Link className="rounded-md px-3 py-2 hover:bg-zinc-900" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-zinc-900" href="/projects">
            Projects
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-zinc-900" href="/knowledge">
            Knowledge
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-zinc-900" href="/mcp">
            MCP
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-zinc-900" href="/settings">
            Settings
          </Link>
        </nav>
      </aside>
      <main className="md:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
          <span className="text-sm text-zinc-400">{user.email}</span>
          <form action="/api/auth/logout" method="post">
            <button className="text-sm text-zinc-400 hover:text-zinc-100">Logout</button>
          </form>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
