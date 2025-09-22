import prisma from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  // temporarily fetch all notes for testing
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });
  return notes;
});
