// server/api/auth/signin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) return { error: "Email and password required" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid email or password" };

  // Create a session token
  const token = crypto.randomUUID();

  // Store session in DB
  await prisma.session.create({
    data: {
      id: token,
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    },
  });

  // Set cookie
  event.node.res.setHeader(
    "Set-Cookie",
    serialize("sessionToken", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    })
  );

  return { user: { id: user.id, email: user.email, name: user.name } };
});
