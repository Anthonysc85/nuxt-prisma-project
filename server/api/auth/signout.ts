// server/api/auth/signout.ts
import { parse, serialize } from "cookie";
import { PrismaClient } from "@prisma/client";
import { defineEventHandler } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const cookie = event.node.req.headers.cookie;
  const token = parse(cookie || "").sessionToken;

  if (token) {
    await prisma.session.delete({ where: { id: token } });
  }

  // clear cookie
  event.node.res.setHeader(
    "Set-Cookie",
    serialize("sessionToken", "", { path: "/", maxAge: 0 })
  );

  return { ok: true };
});
