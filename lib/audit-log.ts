import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "EXPORT"
  | "IMPORT"

export type AuditResource =
  | "USER"
  | "TOOL"
  | "CATEGORY"
  | "PLAN"
  | "PAYMENT"
  | "SETTINGS"
  | "SUBSCRIPTION"

interface AuditLogParams {
  userId?: string
  userEmail?: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details?: Record<string, any>
  status?: "SUCCESS" | "FAILED"
}

/**
 * 创建审计日志
 */
export async function createAuditLog(params: AuditLogParams) {
  // 检查是否启用审计日志
  if (process.env.ENABLE_AUDIT_LOG !== "true") {
    return null
  }

  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") ||
                     headersList.get("x-real-ip") ||
                     "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details || {},
        ipAddress,
        userAgent,
        status: params.status || "SUCCESS",
      },
    })

    return auditLog
  } catch (error) {
    console.error("Failed to create audit log:", error)
    return null
  }
}

/**
 * 获取审计日志列表
 */
export async function getAuditLogs(options?: {
  userId?: string
  action?: AuditAction
  resource?: AuditResource
  limit?: number
  offset?: number
}) {
  const { userId, action, resource, limit = 50, offset = 0 } = options || {}

  const where: any = {}
  if (userId) where.userId = userId
  if (action) where.action = action
  if (resource) where.resource = resource

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total }
}

/**
 * 清理过期的审计日志
 */
export async function cleanupOldAuditLogs() {
  const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || "90")
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    console.log(`Cleaned up ${result.count} old audit logs`)
    return result.count
  } catch (error) {
    console.error("Failed to cleanup old audit logs:", error)
    return 0
  }
}
