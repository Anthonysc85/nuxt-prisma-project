import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const newNote = await prisma.note.create({
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return newNote;
});
