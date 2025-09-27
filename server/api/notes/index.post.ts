import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/utils/prisma";
import { parse } from "cookie";

export default defineEventHandler(async (event) => {
  try {
    const cookies = event.node.req.headers.cookie;
    if (!cookies)
      throw createError({
        statusCode: 401,
        statusMessage: "Not authenticated",
      });

    const { sessionToken } = parse(cookies);
    if (!sessionToken)
      throw createError({
        statusCode: 401,
        statusMessage: "Not authenticated",
      });

    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
      include: { user: true },
    });
    if (!session)
      throw createError({ statusCode: 401, statusMessage: "Invalid session" });

    const body = await readBody(event);
    const { title, content, address, latitude, longitude, position } = body;

    if (!title || !content)
      throw createError({
        statusCode: 400,
        statusMessage: "Title and content required",
      });

    const note = await prisma.note.create({
      data: {
        title,
        content,
        address,
        latitude,
        longitude,
        position: position ?? 0,
        userId: session.user.id,
      },
    });

    return note;
  } catch (err: any) {
    console.error(err);
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Failed to create note",
    });
  }
});
