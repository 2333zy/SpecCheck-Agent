import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@speccheck/db";
import { jsonError, parseJson } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, LoginSchema);
  if (!parsed.ok) return parsed.response;

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return jsonError("Invalid email or password.", 401);
  }

  await setSessionCookie(user.id);
  return Response.json({ id: user.id, email: user.email, name: user.name });
}
