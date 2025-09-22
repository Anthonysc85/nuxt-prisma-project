import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);

  // Temporarily bypass auth for testing
  const deleted = await prisma.note.deleteMany({
    where: { id, userId: 1 }, // always using the default user
  });

  return deleted;
});
