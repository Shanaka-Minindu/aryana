import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db/prisma";
import type { Adapter } from "@auth/core/adapters";
import { Role } from "./lib/generated/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/sign-in", // Redirect to /sign-in for login
    error: "/sign-in",
  },
  session: {
    strategy: "jwt", // Use JSON Web Tokens for session management
    maxAge: 30 * 24 * 60 * 60, // Set session to expire in 30 days
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordCorrect) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    //...authConfig.callbacks, // Import the authorized callback
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        return token;
      }
      // On subsequent requests, refresh token data if needed
      if (token.sub) {
        const existingUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });

        // If user not found, something is wrong
        if (!existingUser) return null;

        // Keep token data fresh
        token.id = existingUser.id;
        token.role = existingUser.role;
        token.name = existingUser.name;
        token.email = existingUser.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role as Role;
      }

      session.user.email = token.email as string;
      session.user.name = token.name;

      return session;
    },
  },
});
