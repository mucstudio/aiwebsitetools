# VPS 自托管部署方案

## VPS 服务器要求

### 最低配置（适合初期）
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

### VPS 提供商推荐（海外用户友好）
1. **DigitalOcean** - $24/月起（4GB RAM）
2. **Vultr** - $18/月起（4GB RAM）
3. **Linode (Akamai)** - $24/月起（4GB RAM）
4. **Hetzner** - €9.5/月起（4GB RAM，欧洲机房）
5. **AWS Lightsail** - $20/月起（4GB RAM）

**推荐机房位置**:
- 美国用户: 纽约、旧金山、洛杉矶
- 欧洲用户: 伦敦、法兰克福、阿姆斯特丹
- 全球用户: 使用 Cloudflare CDN 加速

---

## 技术栈调整（VPS版本）

### 前端
- **框架**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **部署方式**: Standalone 模式

### 后端
- **运行时**: Node.js 20 LTS
- **进程管理**: PM2
- **反向代理**: Nginx
- **数据库**: PostgreSQL 16 (本地安装)
- **缓存**: Redis (可选，提升性能)

### 安全与监控
- **SSL证书**: Let's Encrypt (免费)
- **防火墙**: UFW
- **监控**: PM2 + Grafana (可选)
- **日志**: PM2 logs + Logrotate

### 文件存储
- **本地存储**: /var/www/uploads
- **或使用**: AWS S3 / Cloudflare R2 (推荐)

---

## 服务器架构

```
Internet
    ↓
Cloudflare (CDN + DDoS防护)
    ↓
VPS Server (Ubuntu 22.04)
    ↓
Nginx (反向代理 + SSL)
    ↓
Next.js App (PM2管理，端口3000)
    ↓
PostgreSQL (端口5432)
Redis (端口6379，可选)
```

---

## 完整部署步骤

### 1. 服务器初始化

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 创建新用户（不要用root）
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo su - deploy

# 配置防火墙
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 安装基础工具
sudo apt install -y curl wget git build-essential
```

### 2. 安装 Node.js 20

```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # v20.x.x
npm --version   # 10.x.x

# 安装 pnpm（推荐，比 npm 快）
npm install -g pnpm
```

### 3. 安装 PostgreSQL 16

```bash
# 添加 PostgreSQL 官方仓库
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null

sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行：
CREATE DATABASE aiwebsitetools;
CREATE USER aiwebsitetools_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE aiwebsitetools TO aiwebsitetools_user;
\q
```

### 4. 安装 Redis（可选，用于缓存）

```bash
sudo apt install -y redis-server

# 配置 Redis
sudo nano /etc/redis/redis.conf
# 修改: supervised systemd

sudo systemctl restart redis
sudo systemctl enable redis

# 测试
redis-cli ping  # 应返回 PONG
```

### 5. 安装 Nginx

```bash
sudo apt install -y nginx

# 启动服务
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/aiwebsitetools
```

**Nginx 配置文件**:

```nginx
# /etc/nginx/sites-available/aiwebsitetools

upstream nextjs_app {
    server 127.0.0.1:3000;
    keepalive 64;
}

# HTTP -> HTTPS 重定向
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书（先用自签名，后面用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 文件上传大小限制
    client_max_body_size 50M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://nextjs_app;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /images {
        proxy_pass http://nextjs_app;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Next.js 应用
    location / {
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/aiwebsitetools /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 7. 安装 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书（替换为你的域名）
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期测试
sudo certbot renew --dry-run

# Certbot 会自动添加 cron 任务续期
```

### 8. 部署 Next.js 应用

```bash
# 创建应用目录
sudo mkdir -p /var/www/aiwebsitetools
sudo chown -R deploy:deploy /var/www/aiwebsitetools

# 克隆或上传代码
cd /var/www/aiwebsitetools
git clone <your-repo-url> .
# 或使用 rsync/scp 上传代码

# 安装依赖
pnpm install

# 配置环境变量
nano .env.local
```

**环境变量配置** (.env.local):

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL="postgresql://aiwebsitetools_user:your_strong_password@localhost:5432/aiwebsitetools?schema=public"

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET="your-generated-secret-key"  # 使用: openssl rand -base64 32

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redis (可选)
REDIS_URL=redis://localhost:6379

# Email (使用 Resend 或 SendGrid)
EMAIL_SERVER=smtp://apikey:your_sendgrid_key@smtp.sendgrid.net:587
EMAIL_FROM=noreply@yourdomain.com

# File Upload (本地或 S3)
UPLOAD_DIR=/var/www/aiwebsitetools/public/uploads
# 或使用 S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket
```

```bash
# 运行 Prisma 迁移
pnpm prisma generate
pnpm prisma migrate deploy

# 构建应用（Standalone 模式）
npm run build

# 测试运行
npm run start
# 访问 http://localhost:3000 测试
```

### 9. 配置 Next.js Standalone 模式

**next.config.js**:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // 图片优化
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // 压缩
  compress: true,

  // 生产环境优化
  swcMinify: true,

  // 如果使用 CDN
  assetPrefix: process.env.CDN_URL || '',
}

module.exports = nextConfig
```

### 10. 使用 PM2 管理进程

```bash
# 安装 PM2
sudo npm install -g pm2

# 创建 PM2 配置文件
nano ecosystem.config.js
```

**ecosystem.config.js**:

```javascript
module.exports = {
  apps: [{
    name: 'aiwebsitetools',
    script: '.next/standalone/server.js',
    cwd: '/var/www/aiwebsitetools',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: '/var/log/pm2/aiwebsitetools-error.log',
    out_file: '/var/log/pm2/aiwebsitetools-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // 自动重启配置
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,

    // 优雅重启
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
  }]
}
```

```bash
# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 执行输出的命令

# 常用 PM2 命令
pm2 list              # 查看所有进程
pm2 logs              # 查看日志
pm2 monit             # 监控
pm2 restart all       # 重启
pm2 reload all        # 零停机重启
pm2 stop all          # 停止
pm2 delete all        # 删除
```

---

## 自动化部署脚本

### 创建部署脚本

```bash
nano /var/www/aiwebsitetools/deploy.sh
chmod +x /var/www/aiwebsitetools/deploy.sh
```

**deploy.sh**:

```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# 进入项目目录
cd /var/www/aiwebsitetools

# 拉取最新代码
echo "📥 Pulling latest code..."
git pull origin main

# 安装依赖
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# 运行数据库迁移
echo "🗄️  Running database migrations..."
pnpm prisma generate
pnpm prisma migrate deploy

# 构建应用
echo "🔨 Building application..."
pnpm build

# 重启 PM2
echo "♻️  Restarting application..."
pm2 reload ecosystem.config.js --update-env

echo "✅ Deployment completed successfully!"

# 显示状态
pm2 list
```

**使用方式**:

```bash
cd /var/www/aiwebsitetools
./deploy.sh
```

---

## 数据库备份

### 自动备份脚本

```bash
sudo mkdir -p /var/backups/postgresql
sudo nano /usr/local/bin/backup-db.sh
sudo chmod +x /usr/local/bin/backup-db.sh
```

**backup-db.sh**:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="aiwebsitetools"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# 创建备份
pg_dump -U aiwebsitetools_user $DB_NAME | gzip > $BACKUP_FILE

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

### 设置定时任务

```bash
sudo crontab -e

# 添加以下行（每天凌晨 2 点备份）
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## 监控与日志

### 1. 查看应用日志

```bash
# PM2 日志
pm2 logs

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL 日志
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### 2. 系统监控

```bash
# 安装 htop
sudo apt install -y htop

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 3. PM2 监控（可选）

```bash
# 安装 PM2 Plus（免费版）
pm2 link <secret_key> <public_key>

# 或使用本地监控
pm2 monit
```

---

## 性能优化

### 1. 启用 Redis 缓存

**lib/redis.ts**:

```typescript
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export default redis
```

### 2. 数据库连接池优化

**prisma/schema.prisma**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // 连接池配置
  relationMode = "prisma"
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}
```

### 3. Next.js 缓存配置

```typescript
// app/api/tools/route.ts
export const revalidate = 3600 // 1小时缓存
```

---

## 安全加固

### 1. 配置防火墙规则

```bash
# 只允许必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. 安装 Fail2Ban（防暴力破解）

```bash
sudo apt install -y fail2ban

sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
```

```bash
sudo systemctl restart fail2ban
```

### 3. 定期更新系统

```bash
# 设置自动安全更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Cloudflare CDN 配置（推荐）

### 优势
- 免费 CDN 加速
- DDoS 防护
- SSL/TLS 加密
- 缓存优化
- 全球节点

### 配置步骤

1. 注册 Cloudflare 账号
2. 添加你的域名
3. 修改域名 DNS 服务器为 Cloudflare 提供的
4. 在 Cloudflare 设置：
   - SSL/TLS: Full (strict)
   - 缓存级别: Standard
   - 自动压缩: 开启
   - Brotli: 开启
   - HTTP/3: 开启

---

## 成本估算（月度）

### VPS 方案
- **VPS**: $18-24/月（4GB RAM）
- **域名**: $10-15/年
- **Cloudflare**: 免费（或 Pro $20/月）
- **Stripe**: 2.9% + $0.30 每笔交易
- **总计**: ~$20-30/月

### 对比 Vercel 方案
- **节省**: 约 $30-40/月
- **优势**: 完全控制、无限制
- **劣势**: 需要自己维护

---

## 故障排查

### 应用无法启动

```bash
# 检查 PM2 日志
pm2 logs --err

# 检查端口占用
sudo lsof -i :3000

# 检查数据库连接
psql -U aiwebsitetools_user -d aiwebsitetools -h localhost
```

### Nginx 502 错误

```bash
# 检查 Next.js 是否运行
pm2 list

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 检查连接
sudo -u postgres psql -c "SELECT version();"
```

---

## 总结

VPS 自托管方案提供了：
- ✅ 完全控制权
- ✅ 成本更低（长期）
- ✅ 无平台限制
- ✅ 数据隐私
- ⚠️ 需要运维知识
- ⚠️ 需要自己维护安全

**推荐使用场景**:
- 有一定运维经验
- 需要完全控制
- 预算有限
- 数据敏感

**不推荐场景**:
- 完全没有运维经验
- 需要快速上线
- 团队没有运维人员
