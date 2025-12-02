# AI Website Tools - 完整安装部署指南

本文档提供从零开始的完整安装和部署流程，适用于开发环境和生产环境。

## 📋 目录

1. [系统要求](#系统要求)
2. [开发环境安装](#开发环境安装)
3. [生产环境部署](#生产环境部署)
4. [数据库配置](#数据库配置)
5. [管理员初始化](#管理员初始化)
6. [常见问题](#常见问题)

---

## 系统要求

### 必需软件

- **Node.js**: >= 18.17.0 (推荐 20.x LTS)
- **npm**: >= 9.0.0 或 **pnpm**: >= 8.0.0
- **PostgreSQL**: >= 14.0
- **Git**: 最新版本

### 可选软件

- **Redis**: >= 6.0 (用于缓存和会话)
- **Docker**: >= 20.10 (用于容器化部署)

---

## 开发环境安装

### 步骤 1: 克隆项目

```bash
# 克隆仓库
git clone https://github.com/your-org/aiwebsitetools.git
cd aiwebsitetools
```

### 步骤 2: 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐，更快)
pnpm install
```

### 步骤 3: 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
```

编辑 `.env` 文件，配置以下必填项：

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@localhost:5432/aiwebsitetools?schema=public"

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# 管理员配置
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_NAME="System Administrator"
ADMIN_PASSWORD="YourSecurePassword123!"

# 安全配置
ADMIN_IP_WHITELIST=
ENABLE_AUDIT_LOG=true
AUDIT_LOG_RETENTION_DAYS=90
```

**生成 NEXTAUTH_SECRET：**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 步骤 4: 设置数据库

#### 选项 A: 使用本地 PostgreSQL

```bash
# 创建数据库
createdb aiwebsitetools

# 或使用 psql
psql -U postgres
CREATE DATABASE aiwebsitetools;
\q
```

#### 选项 B: 使用 Supabase (推荐)

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 复制数据库连接字符串到 `.env` 的 `DATABASE_URL`

#### 选项 C: 使用 Docker

```bash
# 启动 PostgreSQL 容器
docker run -d \
  --name aiwebsitetools-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=aiwebsitetools \
  -p 5432:5432 \
  postgres:15-alpine
```

### 步骤 5: 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库架构
npm run db:push
```

**⚠️ 如果遇到 Windows 权限错误：**

```powershell
# 1. 关闭所有开发服务器和编辑器
# 2. 删除旧的 Prisma client
Remove-Item -Recurse -Force node_modules\.prisma

# 3. 重新生成
npm run db:generate
npm run db:push
```

### 步骤 6: 初始化权限系统

```bash
npm run permissions:init
```

**预期输出：**
```
🔐 开始初始化权限系统...
📋 创建 用户管理 权限...
   ✓ users.view
   ✓ users.create
   ✓ users.edit
   ✓ users.delete
...
✅ 权限创建完成，共 27 个权限
✅ 管理员权限分配完成
```

### 步骤 7: 创建管理员账号

```bash
npm run admin:init
```

**预期输出：**
```
🚀 开始初始化管理员账号...
✅ 管理员账号创建成功！
   邮箱: admin@yourdomain.com
   姓名: System Administrator
   角色: ADMIN

🔒 IP 白名单已启用: (或未配置)
📝 审计日志: 已启用
   保留天数: 90 天

✨ 管理员初始化完成！
```

### 步骤 8: 启动开发服务器

```bash
npm run dev
```

访问：
- **前端**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

### 步骤 9: 验证安装

1. **测试前端**
   - 访问 http://localhost:3000
   - 应该看到首页

2. **测试注册登录**
   - 访问 http://localhost:3000/signup
   - 注册一个测试账号
   - 登录成功后应该看到用户仪表板

3. **测试管理后台**
   - 访问 http://localhost:3000/admin
   - 使用 `.env` 中配置的管理员邮箱和密码登录
   - 应该看到管理后台仪表板

---

## 生产环境部署

### 方案 1: Vercel 部署 (推荐)

#### 1. 准备工作

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login
```

#### 2. 配置环境变量

在 Vercel 项目设置中添加所有环境变量：

```env
# 必填
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret

# 管理员配置
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_NAME="System Administrator"
ADMIN_PASSWORD="StrongProductionPassword123!"

# 安全配置 (生产环境必须设置)
ADMIN_IP_WHITELIST=203.0.113.10,203.0.113.11
ENABLE_AUDIT_LOG=true
AUDIT_LOG_RETENTION_DAYS=180

# OAuth (可选)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (可选)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

#### 3. 部署

```bash
# 首次部署
vercel

# 生产部署
vercel --prod
```

#### 4. 初始化生产数据库

```bash
# 连接到生产数据库
DATABASE_URL="your-production-db-url" npm run db:push
DATABASE_URL="your-production-db-url" npm run permissions:init
DATABASE_URL="your-production-db-url" npm run admin:init
```

### 方案 2: VPS 部署 (Ubuntu/Debian)

#### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2 (进程管理器)
sudo npm install -g pm2
```

#### 2. 创建数据库

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE aiwebsitetools;
CREATE USER aiwebsitetools_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE aiwebsitetools TO aiwebsitetools_user;
\q
```

#### 3. 克隆和配置项目

```bash
# 创建应用目录
sudo mkdir -p /var/www/aiwebsitetools
sudo chown $USER:$USER /var/www/aiwebsitetools

# 克隆项目
cd /var/www/aiwebsitetools
git clone https://github.com/your-org/aiwebsitetools.git .

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置
```

#### 4. 构建项目

```bash
# 构建生产版本
npm run build

# 初始化数据库
npm run db:push
npm run permissions:init
npm run admin:init
```

#### 5. 配置 PM2

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'aiwebsitetools',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/aiwebsitetools',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

启动应用：

```bash
# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs aiwebsitetools
```

#### 6. 配置 Nginx

创建 `/etc/nginx/sites-available/aiwebsitetools`：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/aiwebsitetools /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 7. 配置 SSL (Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 方案 3: Docker 部署

#### 1. 创建 Dockerfile

```dockerfile
FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: aiwebsitetools
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/aiwebsitetools
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    depends_on:
      - db

volumes:
  postgres_data:
```

#### 3. 部署

```bash
# 构建和启动
docker-compose up -d

# 初始化数据库
docker-compose exec app npm run db:push
docker-compose exec app npm run permissions:init
docker-compose exec app npm run admin:init

# 查看日志
docker-compose logs -f app
```

---

## 数据库配置

### PostgreSQL 优化

编辑 `postgresql.conf`：

```conf
# 连接设置
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

### 数据库备份

```bash
# 备份
pg_dump -U postgres aiwebsitetools > backup_$(date +%Y%m%d).sql

# 恢复
psql -U postgres aiwebsitetools < backup_20241201.sql

# 自动备份脚本
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/aiwebsitetools"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U postgres aiwebsitetools | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# 添加到 crontab (每天凌晨 2 点备份)
echo "0 2 * * * /usr/local/bin/backup-db.sh" | crontab -
```

---

## 管理员初始化

### 完整初始化流程

```bash
# 1. 推送数据库架构
npm run db:push

# 2. 初始化权限系统 (创建 27 个权限)
npm run permissions:init

# 3. 创建管理员账号
npm run admin:init

# 4. (可选) 更新管理员密码
npm run admin:update-password
```

### 验证初始化

```bash
# 查看数据库
npm run db:studio

# 检查以下表：
# - User: 应该有一个 role=ADMIN 的用户
# - Permission: 应该有 27 条记录
# - RolePermission: 应该有 27 条 ADMIN 角色的权限记录
```

### 创建额外管理员

```bash
# 方法 1: 修改 .env 后重新运行
ADMIN_EMAIL=admin2@yourdomain.com npm run admin:init

# 方法 2: 在数据库中手动升级用户
# 使用 Prisma Studio 或 SQL:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'user@example.com';
```

---

## 常见问题

### Q1: Prisma 权限错误 (EPERM)

**问题：** `EPERM: operation not permitted, rename`

**解决方法：**

```bash
# Windows
# 1. 关闭所有开发服务器
# 2. 关闭 VS Code 和其他编辑器
# 3. 删除 Prisma client
Remove-Item -Recurse -Force node_modules\.prisma
# 4. 重新生成
npm run db:generate

# Linux/Mac
rm -rf node_modules/.prisma
npm run db:generate
```

### Q2: 数据库连接失败

**问题：** `Can't reach database server`

**检查清单：**

1. PostgreSQL 是否运行？
   ```bash
   # Linux
   sudo systemctl status postgresql

   # Mac
   brew services list

   # Windows
   services.msc (查找 postgresql)
   ```

2. 连接字符串是否正确？
   ```env
   # 格式
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

   # 示例
   DATABASE_URL="postgresql://postgres:password@localhost:5432/aiwebsitetools?schema=public"
   ```

3. 防火墙是否允许连接？
   ```bash
   # 测试连接
   psql -h localhost -U postgres -d aiwebsitetools
   ```

### Q3: 管理员无法登录

**问题：** 输入正确密码但无法登录

**解决方法：**

1. 检查 `.env` 配置
   ```bash
   cat .env | grep ADMIN
   ```

2. 重新初始化管理员
   ```bash
   npm run admin:init
   ```

3. 检查用户角色
   ```bash
   npm run db:studio
   # 查看 User 表，确认 role = 'ADMIN'
   ```

4. 更新密码
   ```bash
   npm run admin:update-password
   ```

### Q4: IP 白名单阻止访问

**问题：** 访问 `/admin` 被重定向到 `/unauthorized?reason=ip`

**解决方法：**

1. 开发环境：禁用 IP 白名单
   ```env
   ADMIN_IP_WHITELIST=
   ```

2. 生产环境：添加你的 IP
   ```env
   ADMIN_IP_WHITELIST=203.0.113.10,203.0.113.11
   ```

3. 查看当前 IP
   ```bash
   curl ifconfig.me
   ```

### Q5: 构建失败

**问题：** `npm run build` 失败

**常见原因：**

1. TypeScript 错误
   ```bash
   npm run lint
   ```

2. 环境变量缺失
   ```bash
   # 检查必填变量
   cat .env | grep -E "DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL"
   ```

3. Prisma Client 未生成
   ```bash
   npm run db:generate
   ```

### Q6: 审计日志未记录

**问题：** 操作没有生成审计日志

**解决方法：**

1. 检查配置
   ```env
   ENABLE_AUDIT_LOG=true
   ```

2. 检查数据库表
   ```bash
   npm run db:studio
   # 确认 AuditLog 表存在
   ```

3. 重新推送架构
   ```bash
   npm run db:push
   ```

---

## 维护任务

### 每日任务

```bash
# 清理过期审计日志 (建议设置 cron job)
# 创建脚本: scripts/cleanup-logs.ts
npm run cleanup:audit-logs
```

### 每周任务

- 检查应用日志
- 审查审计日志中的异常操作
- 验证备份是否正常

### 每月任务

- 更新依赖包
  ```bash
  npm outdated
  npm update
  ```
- 审查用户权限
- 更新管理员密码
- 检查安全更新

---

## 性能优化

### 1. 启用 Redis 缓存

```env
REDIS_URL=redis://localhost:6379
```

### 2. 配置 CDN

使用 Vercel、Cloudflare 或 AWS CloudFront 加速静态资源。

### 3. 数据库索引

已在 Prisma schema 中配置，确保运行：

```bash
npm run db:push
```

### 4. 启用压缩

Nginx 配置：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

---

## 安全检查清单

### 部署前检查

- [ ] 更改默认管理员密码
- [ ] 配置 IP 白名单
- [ ] 启用 HTTPS
- [ ] 设置强 NEXTAUTH_SECRET
- [ ] 配置 CORS 策略
- [ ] 启用审计日志
- [ ] 配置数据库备份
- [ ] 设置防火墙规则
- [ ] 配置速率限制
- [ ] 审查环境变量

### 定期检查

- [ ] 审查审计日志
- [ ] 检查失败登录记录
- [ ] 更新依赖包
- [ ] 验证备份
- [ ] 审查用户权限
- [ ] 检查服务器资源使用

---

## 技术支持

### 文档

- [README.md](README.md) - 项目概述
- [ADMIN_SECURITY_GUIDE.md](ADMIN_SECURITY_GUIDE.md) - 安全系统详细指南
- [PROJECT_PLAN.md](PROJECT_PLAN.md) - 项目规划

### 联系方式

- 邮箱: admin@yourdomain.com
- GitHub Issues: [项目地址]
- 文档: [文档地址]

---

**最后更新：** 2024-12-01
**版本：** 1.0.0
**维护者：** AI Website Tools Team
