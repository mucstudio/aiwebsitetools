#!/bin/bash

echo "🚀 开始完整系统优化..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 数据库索引优化
echo -e "${BLUE}📊 步骤 1/5: 添加数据库索引...${NC}"
sudo -u postgres psql -d aiwebsitetools << 'EOF'
-- 工具相关索引
CREATE INDEX IF NOT EXISTS idx_tool_slug ON "Tool"(slug);
CREATE INDEX IF NOT EXISTS idx_tool_published ON "Tool"("isPublished");
CREATE INDEX IF NOT EXISTS idx_tool_category ON "Tool"("categoryId");
CREATE INDEX IF NOT EXISTS idx_tool_created ON "Tool"("createdAt" DESC);

-- 使用记录索引
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON "UsageRecord"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_usage_tool ON "UsageRecord"("toolId");
CREATE INDEX IF NOT EXISTS idx_usage_session_date ON "UsageRecord"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_usage_ip_date ON "UsageRecord"("ipAddress", "createdAt");
CREATE INDEX IF NOT EXISTS idx_usage_created ON "UsageRecord"("createdAt" DESC);

-- 订阅相关索引
CREATE INDEX IF NOT EXISTS idx_subscription_user ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS idx_subscription_status ON "Subscription"(status);
CREATE INDEX IF NOT EXISTS idx_subscription_end_date ON "Subscription"("endDate");

-- 用户相关索引
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);

-- AI 相关索引
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON "AIUsageLog"("userId");
CREATE INDEX IF NOT EXISTS idx_ai_usage_tool ON "AIUsageLog"("toolId");
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON "AIUsageLog"("createdAt" DESC);

-- 分类索引
CREATE INDEX IF NOT EXISTS idx_category_slug ON "Category"(slug);
CREATE INDEX IF NOT EXISTS idx_category_order ON "Category"("order");

-- 计划索引
CREATE INDEX IF NOT EXISTS idx_plan_slug ON "Plan"(slug);
CREATE INDEX IF NOT EXISTS idx_plan_active ON "Plan"("isActive");

-- 收藏索引
CREATE INDEX IF NOT EXISTS idx_favorite_user ON "Favorite"("userId");
CREATE INDEX IF NOT EXISTS idx_favorite_tool ON "Favorite"("toolId");

-- 审计日志索引
CREATE INDEX IF NOT EXISTS idx_audit_user ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS idx_audit_created ON "AuditLog"("createdAt" DESC);
EOF

echo -e "${GREEN}✅ 索引创建完成${NC}"
echo ""

# 2. PostgreSQL 配置优化
echo -e "${BLUE}⚙️  步骤 2/5: 优化 PostgreSQL 配置...${NC}"
sudo -u postgres psql << 'EOF'
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET log_min_duration_statement = 1000;
EOF

echo -e "${GREEN}✅ PostgreSQL 配置优化完成${NC}"
echo ""

# 3. 重启 PostgreSQL
echo -e "${BLUE}♻️  步骤 3/5: 重启 PostgreSQL...${NC}"
sudo systemctl restart postgresql
sleep 3
echo -e "${GREEN}✅ PostgreSQL 重启完成${NC}"
echo ""

# 4. 数据库清理
echo -e "${BLUE}🧹 步骤 4/5: 清理数据库...${NC}"
sudo -u postgres psql -d aiwebsitetools -c "VACUUM ANALYZE;"
echo -e "${GREEN}✅ 数据库清理完成${NC}"
echo ""

# 5. 清理应用缓存并重启
echo -e "${BLUE}♻️  步骤 5/5: 清理应用缓存并重启...${NC}"
cd /root/aiwebsitetools
rm -rf .next/cache
pm2 restart aiwebsitetools
echo -e "${GREEN}✅ 应用重启完成${NC}"
echo ""

# 显示优化结果
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ 优化完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📊 数据库统计信息：${NC}"
sudo -u postgres psql -d aiwebsitetools << 'EOF'
-- 索引数量
SELECT COUNT(*) as "索引数量" FROM pg_indexes WHERE schemaname = 'public';

-- 数据库大小
SELECT pg_size_pretty(pg_database_size('aiwebsitetools')) as "数据库大小";

-- 前5大表
SELECT
  tablename as "表名",
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS "大小"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 5;
EOF

echo ""
echo -e "${YELLOW}📈 性能提升预期：${NC}"
echo "  ✓ 数据库查询速度：提升 50-80%"
echo "  ✓ 页面加载速度：提升 30-50%"
echo "  ✓ 用户体验：明显改善"
echo ""
echo -e "${YELLOW}💡 建议：${NC}"
echo "  • 定期运行此脚本（每月一次）"
echo "  • 监控应用日志：pm2 logs aiwebsitetools"
echo "  • 查看系统资源：htop"
echo ""
echo -e "${GREEN}🎉 所有优化已完成！${NC}"
