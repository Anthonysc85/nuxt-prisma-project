import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/utils/prisma";
import { parse } from "cookie";

export default defineEventHandler(async (event) => {
  try {
    const { updates } = await readBody(event);
    if (!Array.isArray(updates))
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid updates format",
      });

    const cookies = event.node.req.headers.cookie;
    if (!cookies)
      throw createError({
        statusCode: 401,
        statusMessage: "Not authenticated",
      });
    const { sessionToken } = parse(cookies);

    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
      include: { user: true },
    });
    if (!session)
      throw createError({ statusCode: 401, statusMessage: "Invalid session" });

    await prisma.$transaction(
      updates.map((update: { id: number; position: number }) =>
        prisma.note.updateMany({
          where: { id: update.id, userId: session.user.id },
          data: { position: update.position },
        })
      )
    );

    return { success: true };
  } catch (err: any) {
    console.error("Failed to reorder notes:", err);
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Failed to reorder notes",
    });
  }
});
