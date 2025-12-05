import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getSecuritySettings } from "@/lib/settings"

/**
 * 获取客户端真实 IP 地址
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers()

  // 尝试从各种 header 中获取真实 IP
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  const cfConnectingIP = headersList.get("cf-connecting-ip") // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for 可能包含多个 IP，取第一个
    return forwardedFor.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return "unknown"
}

/**
 * 检查 IP 是否在白名单中
 */
export async function isIPWhitelisted(ip: string): Promise<boolean> {
  const settings = await getSecuritySettings()
  const whitelist = settings.adminIpWhitelist

  // 如果没有配置白名单，允许所有 IP
  if (!whitelist || whitelist.trim() === "") {
    return true
  }

  // 解析白名单（逗号分隔）
  const allowedIPs = whitelist.split(",").map(ip => ip.trim())

  // 检查是否在白名单中
  return allowedIPs.includes(ip)
}

/**
 * 检查管理员 IP 白名单（中间件）
 * 如果 IP 不在白名单中，重定向到未授权页面
 */
export async function checkAdminIPWhitelist() {
  const clientIP = await getClientIP()

  if (!(await isIPWhitelisted(clientIP))) {
    console.warn(`Admin access denied for IP: ${clientIP}`)
    redirect("/unauthorized?reason=ip")
  }

  return clientIP
}

/**
 * 验证 IP 格式是否正确
 */
export function isValidIP(ip: string): boolean {
  // IPv4 正则
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 正则（简化版）
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/

  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * 获取白名单配置
 */
export async function getWhitelistConfig() {
  const settings = await getSecuritySettings()
  const whitelist = settings.adminIpWhitelist

  if (!whitelist || whitelist.trim() === "") {
    return {
      enabled: false,
      ips: [],
    }
  }

  const ips = whitelist.split(",").map(ip => ip.trim()).filter(ip => ip)

  return {
    enabled: true,
    ips,
  }
}
