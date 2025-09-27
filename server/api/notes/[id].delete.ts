import { defineEventHandler, createError } from "h3";
import prisma from "~/server/utils/prisma";
import { parse } from "cookie";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id);

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

    await prisma.note.deleteMany({
      where: { id, userId: session.user.id },
    });

    return { success: true };
  } catch (err: any) {
    console.error(err);
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Failed to delete note",
    });
  }
});
