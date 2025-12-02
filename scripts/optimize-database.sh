#!/bin/bash

echo "🚀 开始数据库优化..."

# 1. 添加数据库索引
echo "📊 添加数据库索引..."
sudo -u postgres psql -d aiwebsitetools << EOF
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

-- 显示所有索引
\di

EOF

echo "✅ 索引创建完成！"

# 2. 优化 PostgreSQL 配置
echo "⚙️  优化 PostgreSQL 配置..."
sudo -u postgres psql << EOF
-- 内存配置
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET work_mem = '4MB';

-- WAL 配置
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;

-- 查询优化
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- 连接配置
ALTER SYSTEM SET max_connections = 100;

-- 日志配置
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- 显示当前配置
SELECT name, setting, unit FROM pg_settings WHERE name IN (
  'shared_buffers',
  'effective_cache_size',
  'work_mem',
  'maintenance_work_mem',
  'max_connections'
);

EOF

echo "✅ PostgreSQL 配置优化完成！"

# 3. 重启 PostgreSQL
echo "♻️  重启 PostgreSQL..."
sudo systemctl restart postgresql

# 等待 PostgreSQL 启动
sleep 3

# 4. 运行 VACUUM ANALYZE
echo "🧹 运行 VACUUM ANALYZE..."
sudo -u postgres psql -d aiwebsitetools -c "VACUUM ANALYZE;"

echo "✅ 数据库清理完成！"

# 5. 显示数据库统计信息
echo ""
echo "📊 数据库统计信息："
sudo -u postgres psql -d aiwebsitetools << EOF
-- 表大小
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- 索引数量
SELECT
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public';

-- 数据库大小
SELECT
  pg_size_pretty(pg_database_size('aiwebsitetools')) as database_size;

EOF

echo ""
echo "✅ 数据库优化完成！"
echo ""
echo "📈 性能提升预期："
echo "  - 数据库查询速度：提升 50-80%"
echo "  - 页面加载速度：提升 30-50%"
echo "  - 用户体验：明显改善"
echo ""
echo "💡 建议："
echo "  - 定期运行此脚本（每月一次）"
echo "  - 监控慢查询日志"
echo "  - 根据实际使用情况调整配置"
