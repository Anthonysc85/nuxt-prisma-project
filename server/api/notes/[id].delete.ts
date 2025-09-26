import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);

  try {
    const deletedNote = await prisma.note.delete({
      where: { id },
    });
    return deletedNote;
  } catch (err) {
    return { error: "Note not found or cannot delete" };
  }
});
