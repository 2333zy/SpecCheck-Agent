"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Request failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Login" : "Create account"}</h1>
        <p className="mt-2 text-sm text-zinc-400">Run AI acceptance checks against frontend projects.</p>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          {mode === "register" ? (
            <label className="grid gap-2 text-sm">
              Name
              <Input name="name" placeholder="Ada" />
            </label>
          ) : null}
          <label className="grid gap-2 text-sm">
            Email
            <Input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <label className="grid gap-2 text-sm">
            Password
            <Input name="password" type="password" required minLength={8} />
          </label>
          {error ? <p className="rounded-md bg-red-950 p-3 text-sm text-red-200">{error}</p> : null}
          <Button disabled={loading}>{loading ? "Working..." : mode === "login" ? "Login" : "Register"}</Button>
        </form>
        <p className="mt-4 text-sm text-zinc-400">
          {mode === "login" ? "No account yet? " : "Already have an account? "}
          <Link className="text-cyan-300" href={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Register" : "Login"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
