import prisma from "~/server/utils/prisma";
import { getUserFromEvent } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const note = await prisma.note.create({
    data: { ...body, userId: 1 },
  });

  return note;
});
