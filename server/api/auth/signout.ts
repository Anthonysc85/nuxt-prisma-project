// server/api/auth/signout.ts
import { auth } from "~/auth";
import { parse } from "cookie";

export default defineEventHandler(async (event) => {
  try {
    const cookie = event.node.req.headers.cookie;
    const sessionToken = parse(cookie || "").sessionToken;

    if (sessionToken) {
      await auth.deleteSession(sessionToken);
    }

    // Clear the cookie
    event.node.res.setHeader(
      "Set-Cookie",
      `sessionToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
    );

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message || "Signout failed" };
  }
});
