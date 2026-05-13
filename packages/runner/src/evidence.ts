import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type EvidenceRecord = {
  type: "screenshot" | "console_error" | "network_error" | "dom_text" | "current_url" | "trace";
  filePath?: string;
  content?: string;
  metadata?: Record<string, unknown>;
};

export async function ensureEvidenceDirs(reportDir: string) {
  await mkdir(path.join(reportDir, "screenshots"), { recursive: true });
  await mkdir(path.join(reportDir, "traces"), { recursive: true });
}

export async function saveTextEvidence(reportDir: string, filename: string, content: string) {
  await mkdir(reportDir, { recursive: true });
  const filePath = path.join(reportDir, filename);
  await writeFile(filePath, content, "utf8");
  return filePath;
}
