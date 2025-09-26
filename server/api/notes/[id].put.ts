import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const body = await readBody(event);

  // Update the note and return the updated record
  const updatedNote = await prisma.note.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      address: body.address ?? null,
      // If you want to restrict by user, add userId check manually
    },
  });

  return updatedNote;
});
