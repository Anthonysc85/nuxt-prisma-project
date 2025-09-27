import prisma from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  const notes = await prisma.note.findMany({
    orderBy: { position: "desc" },
  });
  return notes;
});
