import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { validateStartCommand } from "@speccheck/core";

export type DevServerHandle = {
  process: ChildProcessWithoutNullStreams;
  stop: () => Promise<void>;
};

export async function waitForUrl(url: string, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok || response.status < 500) return;
    } catch {
      // Keep polling until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

export async function startDevServer(options: {
  command: string;
  cwd: string;
  url: string;
  timeoutMs?: number;
}): Promise<DevServerHandle> {
  const validation = validateStartCommand(options.command);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  const [bin, ...args] = validation.normalizedCommand.split(" ");
  if (!bin) throw new Error("Missing command binary.");

  const child = spawn(bin, args, {
    cwd: options.cwd,
    env: { ...process.env },
    shell: process.platform === "win32",
    stdio: "pipe",
  });

  const stop = async () => {
    if (child.killed) return;
    child.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!child.killed) child.kill("SIGKILL");
  };

  try {
    await waitForUrl(options.url, options.timeoutMs);
  } catch (error) {
    await stop();
    throw error;
  }

  return { process: child, stop };
}
