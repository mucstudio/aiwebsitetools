import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      emailVerified: Date | null
      createdAt: Date
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    emailVerified: Date | null
    createdAt: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    emailVerified: Date | null
    createdAt: Date
  }
}
