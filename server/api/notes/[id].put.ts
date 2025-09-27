import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/utils/prisma";
import { parse } from "cookie";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id);
    const body = await readBody(event);

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

    const updatedNote = await prisma.note.updateMany({
      where: { id, userId: session.user.id },
      data: {
        title: body.title,
        content: body.content,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        address: body.address ?? null,
      },
    });

    if (updatedNote.count === 0)
      throw createError({ statusCode: 404, statusMessage: "Note not found" });

    return { success: true };
  } catch (err: any) {
    console.error(err);
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Failed to update note",
    });
  }
});
