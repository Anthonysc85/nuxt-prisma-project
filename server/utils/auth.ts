import { parse } from "cookie";
import prisma from "./prisma";
import { createError } from "h3";

export async function getUserFromEvent(event: any) {
  const cookies = event.node.req.headers.cookie;
  if (!cookies)
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });

  const { sessionToken } = parse(cookies);
  if (!sessionToken)
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });

  const session = await prisma.session.findUnique({
    where: { id: sessionToken },
    include: { user: true },
  });

  if (!session)
    throw createError({ statusCode: 401, statusMessage: "Invalid session" });

  return session.user;
}
