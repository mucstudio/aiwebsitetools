import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Check if the current user is an admin
 * Redirects to login if not authenticated, or unauthorized page if not admin
 */
export async function requireAdmin() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/admin")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized")
  }

  return session
}

/**
 * Check if the current user is authenticated
 * Redirects to login page if not authenticated
 */
export async function requireAuth() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  return session
}

/**
 * Get the current session without redirecting
 */
export async function getCurrentSession() {
  const session = await auth()
  return session
}
