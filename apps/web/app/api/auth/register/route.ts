import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@speccheck/db";
import { jsonError, parseJson } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, RegisterSchema);
  if (!parsed.ok) return parsed.response;

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return jsonError("Email is already registered.", 409);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
  });
  await setSessionCookie(user.id);
  return Response.json({ id: user.id, email: user.email, name: user.name });
}
