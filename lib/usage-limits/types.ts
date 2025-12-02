/**
 * 使用限制系统类型定义
 */

export enum UserType {
  GUEST = 'guest',           // 游客（未登录）
  USER = 'user',             // 注册用户（未订阅）
  SUBSCRIBER = 'subscriber'  // 订阅用户
}

/**
 * 全局使用限制配置（存储在 SiteSettings 中，key: 'usage_limits'）
 */
export interface GlobalUsageLimits {
  guest: {
    dailyLimit: number        // 游客每日限制次数，-1 表示无限制
  }
  user: {
    dailyLimit: number        // 注册用户每日限制次数，-1 表示无限制
  }
}

/**
 * 订阅计划限制配置（存储在 Plan.limits 中）
 */
export interface PlanLimits {
  dailyUsage: number          // 每日总使用次数，-1 表示无限制
  toolAccess: 'all' | 'basic' | 'premium'
  aiUsage?: {
    enabled: boolean
    dailyLimit: number
    monthlyLimit: number
  }
}

/**
 * 使用限制检查结果
 */
export interface UsageCheckResult {
  allowed: boolean            // 是否允许使用
  remaining: number           // 剩余次数，-1 表示无限制
  limit: number               // 总限制次数，-1 表示无限制
  userType: UserType          // 用户类型
  reason?: string             // 拒绝原因
  requiresUpgrade?: boolean   // 是否需要升级
  requiresLogin?: boolean     // 是否需要登录
}

/**
 * 使用统计
 */
export interface UsageStats {
  today: number
  thisMonth: number
  total: number
}
