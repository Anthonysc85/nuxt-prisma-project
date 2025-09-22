import prisma from "~/server/utils/prisma";
import { getUserFromEvent } from "~/server/utils/auth";

// example in /server/api/notes/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // TEMP: use default user
  const note = await prisma.note.create({
    data: { ...body, userId: 1 },
  });

  return note;
});
