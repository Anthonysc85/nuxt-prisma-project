import { getCookie } from "h3";
import prisma from "./prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = "super-secret-for-practice";

export async function getUserFromEvent(event) {
  const token = getCookie(event, "auth_token");
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    return user;
  } catch {
    return null;
  }
}
