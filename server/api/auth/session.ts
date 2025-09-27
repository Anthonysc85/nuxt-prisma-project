// server/api/auth/session.ts
import { parse } from "cookie";
import { PrismaClient } from "@prisma/client";
import { defineEventHandler } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const cookie = event.node.req.headers.cookie;
  const token = parse(cookie || "").sessionToken;

  if (!token) return { session: null };

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  });

  if (!session) return { session: null };

  return { session };
});
