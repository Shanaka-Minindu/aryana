import { Role } from "@/lib/generated/prisma";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      cartId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    role?: Role;
    cartId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    cartId: string;
  }
}
