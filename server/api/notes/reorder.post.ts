import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { updates } = await readBody(event);

  if (!Array.isArray(updates)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid updates format",
    });
  }

  try {
    // Update positions in a transaction
    await prisma.$transaction(
      updates.map((update: { id: number; position: number }) =>
        prisma.note.update({
          where: { id: update.id },
          data: { position: update.position },
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder notes:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to reorder notes",
    });
  }
});
