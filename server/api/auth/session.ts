import { PrismaClient } from "@prisma/client";
import { parse } from "cookie";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const cookie = event.node.req.headers.cookie;
  const token = parse(cookie || "").sessionToken;

  if (!token) return { session: null };

  const session = await prisma.session.findUnique({
    where: { sessionToken: token }, // must match schema field
    include: { user: true },
  });

  if (!session) return { session: null };

  return { session };
});
