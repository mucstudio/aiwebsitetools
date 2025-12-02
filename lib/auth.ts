import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import FacebookProvider from "next-auth/providers/facebook"
import TwitterProvider from "next-auth/providers/twitter"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters"
import { Role } from "@prisma/client"
import { getSecuritySettings } from "@/lib/settings"
import { checkLoginAttempt, recordLoginAttempt } from "@/lib/login-protection"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 默认 7 天，将在运行时动态更新
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    // Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    // Twitter OAuth
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0",
    }),
    // Discord OAuth
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // 获取 IP 地址
        const ipAddress = req?.headers?.get("x-forwarded-for") ||
                         req?.headers?.get("x-real-ip") ||
                         "unknown"

        // 检查登录保护
        const loginCheck = await checkLoginAttempt(email, ipAddress)
        if (!loginCheck.allowed) {
          await recordLoginAttempt(email, ipAddress, false)
          throw new Error(loginCheck.error || "登录失败次数过多")
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          await recordLoginAttempt(email, ipAddress, false)
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password)

        if (!isCorrectPassword) {
          await recordLoginAttempt(email, ipAddress, false)
          throw new Error("Invalid credentials")
        }

        // 检查邮箱验证要求
        const settings = await getSecuritySettings()
        if (settings.requireEmailVerification && !user.emailVerified) {
          throw new Error("请先验证您的邮箱地址")
        }

        // 记录成功的登录
        await recordLoginAttempt(email, ipAddress, true)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.image = token.picture
        session.user.role = token.role as Role
      }

      // 动态设置会话超时
      try {
        const settings = await getSecuritySettings()
        const maxAge = settings.sessionTimeout * 24 * 60 * 60 // 转换为秒
        session.expires = new Date(Date.now() + maxAge * 1000).toISOString()
      } catch (error) {
        console.error("Failed to get session timeout:", error)
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        return token
      }

      const dbUser = await prisma.user.findUnique({
        where: {
          email: token.email!,
        },
      })

      if (!dbUser) {
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
      }
    },
  },
})
