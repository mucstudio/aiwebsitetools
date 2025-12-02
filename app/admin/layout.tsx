import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { requireAdmin } from "@/lib/auth-utils"
import { checkAdminIPWhitelist } from "@/lib/ip-whitelist"
import { createAuditLog } from "@/lib/audit-log"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication check - redirects if not admin
  const session = await requireAdmin()

  // IP whitelist check - redirects if IP not allowed
  const clientIP = await checkAdminIPWhitelist()

  // Log admin access
  await createAuditLog({
    userId: session.user.id,
    userEmail: session.user.email || undefined,
    action: "VIEW",
    resource: "SETTINGS",
    details: {
      page: "admin_dashboard",
      ip: clientIP,
    },
  })

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        {children}
      </main>
    </div>
  )
}
