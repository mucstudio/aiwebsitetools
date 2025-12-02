# VPS 自托管部署完整指南

> **重要提示**：本文档基于实际部署经验编写，包含所有常见问题的解决方案。

---

## 目录

1. [服务器要求](#服务器要求)
2. [技术栈](#技术栈)
3. [部署步骤](#部署步骤)
4. [常见问题解决](#常见问题解决)
5. [自动化部署](#自动化部署)
6. [监控与维护](#监控与维护)

---

## 服务器要求

### 最低配置（适合初期测试）
- **CPU**: 2核
- **内存**: 4GB RAM
- **存储**: 40GB SSD
- **带宽**: 2TB/月
- **操作系统**: Ubuntu 22.04 LTS

### 推荐配置（生产环境）
- **CPU**: 4核
- **内存**: 8GB RAM
- **存储**: 80GB SSD
- **带宽**: 5TB/月
- **操作系统**: Ubuntu 22.04 LTS

### VPS 提供商推荐
1. **Vultr** - $18/月起（4GB RAM）- 推荐
2. **DigitalOcean** - $24/月起（4GB RAM）
3. **Linode** - $24/月起（4GB RAM）
4. **Hetzner** - €9.5/月起（4GB RAM，欧洲）

---

## 技术栈

- **运行时**: Node.js 20 LTS
- **框架**: Next.js 15 (App Router)
- **数据库**: PostgreSQL 16
- **进程管理**: PM2
- **反向代理**: Nginx
- **SSL**: Let's Encrypt
- **包管理器**: pnpm

---

## 部署步骤

### 步骤 1: 服务器初始化

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装基础工具
sudo apt install -y curl wget git build-essential

# 3. 配置防火墙
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 步骤 2: 安装 Node.js 20

```bash
# 使用 NodeSource 官方仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应显示 v20.x.x
npm --version   # 应显示 10.x.x

# 安装 pnpm（推荐，比 npm 快 2-3 倍）
npm install -g pnpm

# 验证 pnpm
pnpm --version
```

### 步骤 3: 安装 PostgreSQL 16

```bash
# 1. 添加 PostgreSQL 官方仓库
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null

# 2. 安装 PostgreSQL
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# 3. 启动并设置开机自启
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. 验证安装
sudo systemctl status postgresql
```

### 步骤 4: 配置 PostgreSQL 数据库

```bash
# 1. 进入 PostgreSQL
sudo -u postgres psql
```

在 PostgreSQL 命令行中执行以下命令：

```sql
-- 创建数据库
CREATE DATABASE aiwebsitetools;

-- 创建用户并设置密码（请修改为强密码）
CREATE USER aiwebsitetools_user WITH ENCRYPTED PASSWORD 'YourStrongPassword123!';

-- 授予数据库权限
GRANT ALL PRIVILEGES ON DATABASE aiwebsitetools TO aiwebsitetools_user;

-- 连接到数据库
\c aiwebsitetools

-- 授予 schema 权限（重要！）
GRANT ALL ON SCHEMA public TO aiwebsitetools_user;
ALTER SCHEMA public OWNER TO aiwebsitetools_user;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aiwebsitetools_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aiwebsitetools_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO aiwebsitetools_user;

-- 验证权限
\dn+ public

-- 退出
\q
```

**验证数据库连接**：

```bash
# 测试连接
psql -U aiwebsitetools_user -d aiwebsitetools -h localhost -W

# 如果成功连接，输入 \q 退出
```

### 步骤 5: 克隆项目代码

```bash
# 1. 创建项目目录
sudo mkdir -p /root/aiwebsitetools
cd /root/aiwebsitetools

# 2. 克隆代码（替换为你的仓库地址）
git clone https://github.com/your-username/aiwebsitetools.git .

# 或者如果已经有代码，使用 git pull
git pull origin main
```

### 步骤 6: 配置环境变量

```bash
# 创建 .env 文件
nano .env
```

**完整的 .env 配置**：

```env
# 数据库配置（重要：使用你在步骤4设置的密码）
DATABASE_URL="postgresql://aiwebsitetools_user:YourStrongPassword123!@localhost:5432/aiwebsitetools?schema=public"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# 管理员配置
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME="System Administrator"
ADMIN_PASSWORD="your-admin-password"

# AI 加密密钥（用于加密 API keys）
ENCRYPTION_KEY="your-encryption-key-32-characters-long"

# 审计日志
ENABLE_AUDIT_LOG=true
AUDIT_LOG_RETENTION_DAYS=90

# OAuth 配置（可选）
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# 生产环境设置
NODE_ENV=production
```

**保存并退出**：按 `Ctrl+X`，然后 `Y`，然后 `Enter`

### 步骤 7: 安装依赖

```bash
# 使用 pnpm 安装依赖
pnpm install

# 如果遇到权限问题，使用：
# npm install --unsafe-perm
```

### 步骤 8: 初始化数据库

```bash
# 1. 生成 Prisma Client
pnpm prisma generate

# 2. 推送数据库 schema（首次部署使用这个）
pnpm prisma db push

# 或者如果有 migrations 文件夹，使用：
# pnpm prisma migrate deploy
```

**常见问题**：如果遇到权限错误，返回步骤 4 重新设置权限。

### 步骤 9: 构建应用

```bash
# 构建 Next.js 应用
npm run build
```

**⚠️ 重要提示**：

如果构建过程中遇到以下错误：

1. **`useSearchParams` 错误**：已在代码中修复，确保代码是最新的
2. **`published` 字段错误**：已修复为 `isPublished`
3. **TypeScript/ESLint 错误**：已在 `next.config.js` 中配置忽略

如果构建失败，执行：

```bash
# 清理缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新生成 Prisma Client
pnpm prisma generate

# 重新构建
npm run build
```

### 步骤 10: 使用 PM2 管理进程

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 启动应用
pm2 start npm --name "aiwebsitetools" -- start

# 3. 查看状态
pm2 status

# 4. 查看日志
pm2 logs aiwebsitetools

# 5. 设置开机自启
pm2 startup
# 执行输出的命令（通常是一个 sudo 命令）

# 6. 保存 PM2 配置
pm2 save
```

**常用 PM2 命令**：

```bash
pm2 list              # 查看所有进程
pm2 logs              # 查看日志
pm2 logs --err        # 只看错误日志
pm2 restart all       # 重启所有进程
pm2 stop all          # 停止所有进程
pm2 delete all        # 删除所有进程
pm2 monit             # 实时监控
```

### 步骤 11: 安装 Nginx（可选，用于反向代理）

```bash
# 1. 安装 Nginx
sudo apt install -y nginx

# 2. 创建配置文件
sudo nano /etc/nginx/sites-available/aiwebsitetools
```

**Nginx 配置**（简化版，适合开始使用）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

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

```bash
# 3. 启用配置
sudo ln -s /etc/nginx/sites-available/aiwebsitetools /etc/nginx/sites-enabled/

# 4. 测试配置
sudo nginx -t

# 5. 重启 Nginx
sudo systemctl restart nginx

# 6. 设置开机自启
sudo systemctl enable nginx
```

### 步骤 12: 配置 SSL（Let's Encrypt）

```bash
# 1. 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. 获取 SSL 证书（替换为你的域名）
sudo certbot --nginx -d your-domain.com

# 3. 测试自动续期
sudo certbot renew --dry-run
```

### 步骤 13: 验证部署

```bash
# 1. 检查应用是否运行
pm2 status

# 2. 检查日志
pm2 logs aiwebsitetools --lines 50

# 3. 测试访问
curl http://localhost:3000

# 4. 如果配置了 Nginx，测试域名
curl http://your-domain.com
```

---

## 常见问题解决

### 问题 1: PostgreSQL 权限错误

**错误信息**：
```
ERROR: permission denied for schema public
```

**解决方案**：

```bash
sudo -u postgres psql -d aiwebsitetools
```

```sql
GRANT ALL ON SCHEMA public TO aiwebsitetools_user;
ALTER SCHEMA public OWNER TO aiwebsitetools_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aiwebsitetools_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aiwebsitetools_user;
\q
```

### 问题 2: 数据库连接失败

**错误信息**：
```
Authentication failed against database server
```

**解决方案**：

1. 检查 `.env` 文件中的密码是否正确
2. 确保数据库用户已创建：

```bash
sudo -u postgres psql -c "\du" | grep aiwebsitetools_user
```

3. 如果用户不存在，重新创建：

```bash
sudo -u postgres psql
```

```sql
CREATE USER aiwebsitetools_user WITH ENCRYPTED PASSWORD 'YourPassword';
GRANT ALL PRIVILEGES ON DATABASE aiwebsitetools TO aiwebsitetools_user;
\q
```

### 问题 3: 构建时 `useSearchParams` 错误

**错误信息**：
```
useSearchParams() should be wrapped in a suspense boundary
```

**解决方案**：

代码已修复。如果仍然遇到，确保代码是最新的：

```bash
git pull origin main
npm run build
```

### 问题 4: 构建时 `published` 字段错误

**错误信息**：
```
Unknown argument `published`. Did you mean `isPublished`?
```

**解决方案**：

代码已修复。拉取最新代码：

```bash
git pull origin main
pnpm prisma generate
npm run build
```

### 问题 5: PM2 应用无法启动

**检查步骤**：

```bash
# 1. 查看错误日志
pm2 logs aiwebsitetools --err

# 2. 检查端口是否被占用
sudo lsof -i :3000

# 3. 如果端口被占用，杀死进程
sudo kill -9 <PID>

# 4. 重新启动
pm2 restart aiwebsitetools
```

### 问题 6: Nginx 502 Bad Gateway

**解决方案**：

```bash
# 1. 检查 Next.js 是否运行
pm2 list

# 2. 如果没运行，启动它
pm2 start aiwebsitetools

# 3. 检查 Nginx 配置
sudo nginx -t

# 4. 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题 7: 内存不足

**症状**：应用频繁重启或崩溃

**解决方案**：

```bash
# 1. 检查内存使用
free -h

# 2. 配置 PM2 内存限制
pm2 start npm --name "aiwebsitetools" --max-memory-restart 1G -- start

# 3. 或者升级服务器内存
```

---

## 自动化部署脚本

### 创建部署脚本

```bash
nano /root/aiwebsitetools/deploy.sh
chmod +x /root/aiwebsitetools/deploy.sh
```

**deploy.sh 内容**：

```bash
#!/bin/bash

set -e

echo "🚀 开始部署..."

# 进入项目目录
cd /root/aiwebsitetools

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
pnpm prisma generate

# 推送数据库 schema
echo "🗄️  同步数据库..."
pnpm prisma db push

# 构建应用
echo "🔨 构建应用..."
npm run build

# 重启 PM2
echo "♻️  重启应用..."
pm2 restart aiwebsitetools

echo "✅ 部署完成！"

# 显示状态
pm2 list
pm2 logs aiwebsitetools --lines 20
```

**使用方式**：

```bash
cd /root/aiwebsitetools
./deploy.sh
```

---

## 监控与维护

### 1. 查看应用日志

```bash
# 实时查看日志
pm2 logs aiwebsitetools

# 查看最近 100 行日志
pm2 logs aiwebsitetools --lines 100

# 只看错误日志
pm2 logs aiwebsitetools --err
```

### 2. 监控系统资源

```bash
# 安装 htop
sudo apt install -y htop

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# PM2 监控
pm2 monit
```

### 3. 数据库备份

**创建备份脚本**：

```bash
sudo nano /usr/local/bin/backup-db.sh
sudo chmod +x /usr/local/bin/backup-db.sh
```

**backup-db.sh 内容**：

```bash
#!/bin/bash

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="aiwebsitetools"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 创建备份
PGPASSWORD='YourPassword' pg_dump -U aiwebsitetools_user -h localhost $DB_NAME | gzip > $BACKUP_FILE

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_FILE"
```

**设置定时备份**：

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天凌晨 2 点备份）
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### 4. 更新应用

```bash
# 方式 1: 使用部署脚本
cd /root/aiwebsitetools
./deploy.sh

# 方式 2: 手动更新
cd /root/aiwebsitetools
git pull
pnpm install
pnpm prisma generate
pnpm prisma db push
npm run build
pm2 restart aiwebsitetools
```

---

## 性能优化建议

### 1. 启用 Gzip 压缩（Nginx）

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
```

### 2. 配置缓存

在 Nginx 配置中添加：

```nginx
location /_next/static {
    proxy_pass http://localhost:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 3. PM2 集群模式

```bash
# 使用所有 CPU 核心
pm2 start npm --name "aiwebsitetools" -i max -- start
```

---

## 安全建议

### 1. 配置防火墙

```bash
sudo ufw status
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 定期更新系统

```bash
# 手动更新
sudo apt update && sudo apt upgrade -y

# 设置自动安全更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. 更改 SSH 端口（可选）

```bash
sudo nano /etc/ssh/sshd_config
# 修改 Port 22 为其他端口，如 2222
sudo systemctl restart sshd
sudo ufw allow 2222/tcp
```

---

## 成本估算

### 月度成本
- **VPS (4GB RAM)**: $18-24/月
- **域名**: $10-15/年 (~$1/月)
- **SSL 证书**: 免费 (Let's Encrypt)
- **总计**: ~$20-25/月

### 对比 Vercel Pro
- **Vercel Pro**: $20/月 + 超额费用
- **VPS 优势**: 无限制、完全控制
- **VPS 劣势**: 需要自己维护

---

## 快速命令参考

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs aiwebsitetools

# 重启应用
pm2 restart aiwebsitetools

# 查看数据库
sudo -u postgres psql -d aiwebsitetools

# 查看 Nginx 状态
sudo systemctl status nginx

# 重启 Nginx
sudo systemctl restart nginx

# 查看系统资源
htop

# 查看磁盘空间
df -h

# 部署更新
cd /root/aiwebsitetools && ./deploy.sh
```

---

## 总结

✅ **完成以上步骤后，你的应用应该已经成功部署并运行**

如果遇到问题：
1. 查看 PM2 日志：`pm2 logs aiwebsitetools --err`
2. 查看 Nginx 日志：`sudo tail -f /var/log/nginx/error.log`
3. 检查数据库连接：`psql -U aiwebsitetools_user -d aiwebsitetools -h localhost`

**需要帮助？** 检查"常见问题解决"部分，或查看日志文件获取详细错误信息。
