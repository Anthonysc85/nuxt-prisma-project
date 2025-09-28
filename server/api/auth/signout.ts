import { auth } from "~/auth";
import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { sessionToken } = body;

  try {
    await auth.deleteSession(sessionToken);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Signout failed" };
  }
});
