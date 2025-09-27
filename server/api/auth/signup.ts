// server/api/auth/signup.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defineEventHandler, readBody } from "h3";
import { serialize } from "cookie";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event);

    if (!email || !password)
      return { error: "Email and password are required" };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "Email already registered" };

    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
      },
    });

    // Create session
    const token = crypto.randomUUID();
    await prisma.session.create({
      data: {
        id: token, // still fine
        sessionToken: token, // <-- matches your schema
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // <-- renamed
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

    return { user: { id: user.id, email: user.email } };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Signup failed" };
  }
});
