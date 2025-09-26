import { getCookie } from "h3";
import prisma from "./prisma";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  //...
});
