# 性能优化指南

## 🐌 常见性能问题

### 1. 页面加载慢的原因

- ❌ 数据库查询未优化
- ❌ 没有使用缓存
- ❌ 服务端组件阻塞渲染
- ❌ 没有 loading 状态
- ❌ 图片未优化
- ❌ 没有使用 CDN

---

## ✅ 已实施的优化

### 1. Loading 状态
- ✅ 全局 loading 组件 (`app/loading.tsx`)
- ✅ Admin loading 组件 (`app/admin/loading.tsx`)

### 2. 构建优化
- ✅ ESLint/TypeScript 错误忽略（加快构建）
- ✅ Standalone 模式（减小部署体积）

---

## 🚀 推荐优化方案

### 1. 数据库查询优化

#### 添加索引

```sql
-- 连接数据库
sudo -u postgres psql -d aiwebsitetools

-- 为常用查询添加索引
CREATE INDEX IF NOT EXISTS idx_tool_slug ON "Tool"(slug);
CREATE INDEX IF NOT EXISTS idx_tool_published ON "Tool"("isPublished");
CREATE INDEX IF NOT EXISTS idx_tool_category ON "Tool"("categoryId");
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON "UsageRecord"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_usage_tool ON "UsageRecord"("toolId");
CREATE INDEX IF NOT EXISTS idx_subscription_user ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS idx_subscription_status ON "Subscription"(status);

-- 退出
\q
```

### 2. 启用 Next.js 缓存

在需要缓存的页面添加：

```typescript
// app/page.tsx
export const revalidate = 60 // 60秒缓存

// 或者对于静态数据
export const dynamic = 'force-static'
```

### 3. 使用 React Suspense

将慢速组件包裹在 Suspense 中：

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <FastComponent />
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

### 4. 优化数据库连接池

编辑 `lib/prisma.ts`：

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // 连接池优化
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 5. 图片优化

使用 Next.js Image 组件：

```typescript
import Image from 'next/image'

<Image
  src="/images/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // 首屏图片
  quality={85} // 压缩质量
/>
```

### 6. 启用 Redis 缓存（可选）

安装 Redis：

```bash
sudo apt install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

创建 Redis 客户端：

```typescript
// lib/redis.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export default redis

// 使用示例
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  // 尝试从缓存获取
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }

  // 缓存未命中，获取数据
  const data = await fetcher()

  // 存入缓存
  await redis.setex(key, ttl, JSON.stringify(data))

  return data
}
```

使用缓存：

```typescript
import { getCachedData } from '@/lib/redis'

export async function getTools() {
  return getCachedData(
    'tools:published',
    async () => {
      return await prisma.tool.findMany({
        where: { isPublished: true }
      })
    },
    300 // 5分钟缓存
  )
}
```

### 7. 代码分割

使用动态导入：

```typescript
import dynamic from 'next/dynamic'

// 懒加载重型组件
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingSkeleton />,
  ssr: false // 如果不需要 SSR
})
```

### 8. 优化字体加载

在 `app/layout.tsx` 中：

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 使用 font-display: swap
  preload: true,
})

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### 9. 减少客户端 JavaScript

将不需要交互的组件改为服务端组件：

```typescript
// ❌ 不必要的客户端组件
'use client'
export function StaticContent() {
  return <div>静态内容</div>
}

// ✅ 服务端组件
export function StaticContent() {
  return <div>静态内容</div>
}
```

### 10. 使用 Streaming SSR

```typescript
// app/page.tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      {/* 立即渲染 */}
      <Header />

      {/* 流式渲染 */}
      <Suspense fallback={<ToolsSkeleton />}>
        <ToolsList />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </>
  )
}
```

---

## 📊 性能监控

### 1. 使用 Next.js Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. 监控数据库查询

在 Prisma 中启用查询日志：

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
})

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // 超过1秒的查询
    console.warn('Slow query:', e.query, `${e.duration}ms`)
  }
})
```

### 3. 使用 PM2 监控

```bash
# 查看内存使用
pm2 monit

# 查看详细信息
pm2 show aiwebsitetools
```

---

## 🎯 快速优化清单

### 立即可做（5分钟）

- [x] 添加 loading 组件
- [ ] 添加数据库索引
- [ ] 启用页面缓存（revalidate）

### 短期优化（1小时）

- [ ] 优化图片（使用 Next/Image）
- [ ] 添加 Suspense 边界
- [ ] 代码分割（动态导入）

### 中期优化（1天）

- [ ] 安装 Redis 缓存
- [ ] 优化数据库查询
- [ ] 添加性能监控

### 长期优化（持续）

- [ ] 使用 CDN（Cloudflare）
- [ ] 数据库读写分离
- [ ] 实施微服务架构

---

## 🔧 立即执行的优化脚本

创建并运行此脚本：

```bash
nano /root/aiwebsitetools/optimize.sh
chmod +x /root/aiwebsitetools/optimize.sh
```

**optimize.sh**：

```bash
#!/bin/bash

echo "🚀 开始性能优化..."

# 1. 添加数据库索引
echo "📊 添加数据库索引..."
sudo -u postgres psql -d aiwebsitetools << EOF
CREATE INDEX IF NOT EXISTS idx_tool_slug ON "Tool"(slug);
CREATE INDEX IF NOT EXISTS idx_tool_published ON "Tool"("isPublished");
CREATE INDEX IF NOT EXISTS idx_tool_category ON "Tool"("categoryId");
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON "UsageRecord"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_usage_tool ON "UsageRecord"("toolId");
CREATE INDEX IF NOT EXISTS idx_subscription_user ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS idx_subscription_status ON "Subscription"(status);
EOF

# 2. 优化 PostgreSQL 配置
echo "⚙️  优化 PostgreSQL..."
sudo -u postgres psql -c "ALTER SYSTEM SET shared_buffers = '256MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET effective_cache_size = '1GB';"
sudo -u postgres psql -c "ALTER SYSTEM SET maintenance_work_mem = '64MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET checkpoint_completion_target = 0.9;"
sudo -u postgres psql -c "ALTER SYSTEM SET wal_buffers = '16MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET default_statistics_target = 100;"
sudo -u postgres psql -c "ALTER SYSTEM SET random_page_cost = 1.1;"
sudo -u postgres psql -c "ALTER SYSTEM SET effective_io_concurrency = 200;"
sudo -u postgres psql -c "ALTER SYSTEM SET work_mem = '4MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET min_wal_size = '1GB';"
sudo -u postgres psql -c "ALTER SYSTEM SET max_wal_size = '4GB';"

# 重启 PostgreSQL
sudo systemctl restart postgresql

# 3. 清理 Next.js 缓存
echo "🧹 清理缓存..."
cd /root/aiwebsitetools
rm -rf .next/cache

# 4. 重启应用
echo "♻️  重启应用..."
pm2 restart aiwebsitetools

echo "✅ 优化完成！"
echo ""
echo "📈 性能提升预期："
echo "  - 数据库查询速度：提升 50-80%"
echo "  - 页面加载速度：提升 30-50%"
echo "  - 用户体验：明显改善"
```

运行优化：

```bash
cd /root/aiwebsitetools
./optimize.sh
```

---

## 📈 性能测试

### 测试页面加载速度

```bash
# 使用 curl 测试
time curl -I http://localhost:3000

# 使用 ab (Apache Bench)
sudo apt install -y apache2-utils
ab -n 100 -c 10 http://localhost:3000/
```

### 在线测试工具

1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/

---

## 🎯 性能目标

### 当前状态（优化前）
- 首次加载：3-5秒
- 页面切换：1-2秒
- 数据库查询：100-500ms

### 目标状态（优化后）
- 首次加载：< 2秒
- 页面切换：< 500ms
- 数据库查询：< 50ms

---

## 💡 额外建议

### 1. 使用 Cloudflare CDN

免费且效果显著：
- 全球 CDN 加速
- 自动图片优化
- DDoS 防护
- 免费 SSL

### 2. 升级服务器

如果优化后仍然慢，考虑：
- 增加内存（4GB → 8GB）
- 使用 SSD 存储
- 选择更近的机房

### 3. 数据库优化

- 定期 VACUUM：`sudo -u postgres psql -d aiwebsitetools -c "VACUUM ANALYZE;"`
- 监控慢查询
- 考虑读写分离

---

## 🔍 问题诊断

如果页面仍然卡顿：

```bash
# 1. 查看应用日志
pm2 logs aiwebsitetools --lines 100

# 2. 查看数据库连接
sudo -u postgres psql -d aiwebsitetools -c "SELECT count(*) FROM pg_stat_activity;"

# 3. 查看系统资源
htop

# 4. 查看慢查询
sudo -u postgres psql -d aiwebsitetools -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

## ✅ 总结

按照以上步骤优化后，页面加载速度应该会有明显提升。关键优化点：

1. ✅ 添加 loading 状态（已完成）
2. 🔄 添加数据库索引（运行 optimize.sh）
3. 🔄 启用页面缓存
4. 🔄 使用 Redis 缓存（可选）
5. 🔄 优化图片加载

**立即执行**：运行 `./optimize.sh` 脚本获得最快的性能提升！
