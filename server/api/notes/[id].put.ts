import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const body = await readBody(event);

  // Hardcode default user
  const updatedNote = await prisma.note.updateMany({
    where: { id, userId: 1 }, // only updates note with userId 1
    data: { title: body.title, content: body.content },
  });

  return updatedNote;
});
