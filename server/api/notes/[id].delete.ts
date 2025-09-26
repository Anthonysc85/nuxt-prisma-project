import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);

  try {
    const deletedNote = await prisma.note.delete({
      where: { id }, // only delete the specific note
    });
    return deletedNote; // returns the deleted note
  } catch (err) {
    // If note doesn't exist or userId check fails
    return { error: "Note not found or cannot delete" };
  }
});
