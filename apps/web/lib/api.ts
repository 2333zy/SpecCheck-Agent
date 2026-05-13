import { NextResponse } from "next/server";
import { z } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJson<T>(request: Request, schema: z.ZodSchema<T>) {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    return { ok: false as const, response: jsonError(result.error.issues[0]?.message ?? "Invalid input") };
  }
  return { ok: true as const, data: result.data };
}
