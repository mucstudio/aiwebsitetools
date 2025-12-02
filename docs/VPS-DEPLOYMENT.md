# VPS 部署文档

本文档详细说明如何在 VPS 服务器上部署 AI Website Tools 项目。

## 📋 目录

- [系统要求](#系统要求)
- [初始服务器设置](#初始服务器设置)
- [安装依赖](#安装依赖)
- [部署项目](#部署项目)
- [配置环境变量](#配置环境变量)
- [数据库设置](#数据库设置)
- [构建和启动](#构建和启动)
- [使用 PM2 管理进程](#使用-pm2-管理进程)
- [配置 Nginx 反向代理](#配置-nginx-反向代理)
- [SSL 证书配置](#ssl-证书配置)
- [添加工具后的重建流程](#添加工具后的重建流程)
- [常见问题](#常见问题)

---

## 系统要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **Node.js**: v18.0.0 或更高版本
- **内存**: 至少 2GB RAM
- **存储**: 至少 20GB 可用空间
- **数据库**: PostgreSQL 14+ 或 MySQL 8+

---

## 初始服务器设置

### 1. 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

### 2. 创建部署用户（可选但推荐）

```bash
# 创建新用户
sudo adduser deploy

# 添加到 sudo 组
sudo usermod -aG sudo deploy

# 切换到新用户
su - deploy
```

---

## 安装依赖

### 1. 安装 Node.js

```bash
# 使用 NodeSource 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装 Git

```bash
sudo apt install -y git
```

### 3. 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2
```

### 4. 安装数据库

#### PostgreSQL（推荐）

```bash
# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行：
CREATE DATABASE aiwebsitetools;
CREATE USER aiuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aiwebsitetools TO aiuser;
\c aiwebsitetools
GRANT ALL ON SCHEMA public TO aiuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aiuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aiuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aiuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aiuser;
\q
```

#### MySQL（备选）

```bash
# 安装 MySQL
sudo apt install -y mysql-server

# 安全配置
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql

# 在 MySQL 命令行中执行：
CREATE DATABASE aiwebsitetools;
CREATE USER 'aiuser'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON aiwebsitetools.* TO 'aiuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 部署项目

### 1. 克隆代码仓库

```bash
# 进入项目目录
cd /var/www

# 克隆仓库
sudo git clone https://github.com/your-username/aiwebsitetools.git
cd aiwebsitetools

# 设置权限
sudo chown -R deploy:deploy /var/www/aiwebsitetools
```

### 2. 安装项目依赖

```bash
npm install
```

---

## 配置环境变量

### 1. 创建 .env 文件

```bash
cp .env.example .env
nano .env
```

### 2. 配置环境变量

```env
# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# 数据库配置（PostgreSQL）
DATABASE_URL="postgresql://aiuser:your_secure_password@localhost:5432/aiwebsitetools"

# 或 MySQL
# DATABASE_URL="mysql://aiuser:your_secure_password@localhost:3306/aiwebsitetools"

# NextAuth 配置
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Google OAuth（可选）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth（可选）
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# AI API 配置
# 注意：AI 提供商和模型配置在管理后台的 AI 设置中管理
# 不需要在这里配置 API 密钥

# 自动重建配置（可选）
AUTO_REBUILD=false  # 设置为 true 启用自动重建
```

### 3. 生成 NextAuth Secret

```bash
openssl rand -base64 32
```

将生成的密钥复制到 `NEXTAUTH_SECRET`。

---

## 数据库设置

### 1. 运行数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 运行迁移
npx prisma migrate deploy

# 或者直接推送 schema（开发环境）
npx prisma db push
```

### 2. 创建管理员账户（可选）

```bash
# 使用 Prisma Studio
npx prisma studio

# 或通过命令行
npx prisma db seed
```

---

## 构建和启动

### 1. 构建项目

```bash
npm run build
```

### 2. 测试运行

```bash
npm start
```

访问 `http://your-server-ip:3000` 测试是否正常运行。

---

## 使用 PM2 管理进程

### 1. 创建 PM2 配置文件

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'aiwebsitetools',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/aiwebsitetools',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 2. 启动应用

```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs aiwebsitetools

# 设置开机自启
pm2 startup
pm2 save
```

### 3. PM2 常用命令

```bash
# 重启应用
pm2 restart aiwebsitetools

# 停止应用
pm2 stop aiwebsitetools

# 删除应用
pm2 delete aiwebsitetools

# 查看详细信息
pm2 show aiwebsitetools

# 监控
pm2 monit
```

---

## 配置 Nginx 反向代理

### 1. 安装 Nginx

```bash
sudo apt install -y nginx
```

### 2. 创建 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/aiwebsitetools
```

```nginx
# 定义缓存区域（在 http 块中，server 块外）
proxy_cache_path /var/cache/nginx/nextjs levels=1:2 keys_zone=nextjs_cache:10m max_size=1g inactive=60m;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 禁用 HTML 缓存
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }

    # 静态文件缓存（带版本哈希的文件）
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache nextjs_cache;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Cache-Status $upstream_cache_status;
    }

    # 动态生成的页面数据
    location /_next/data {
        proxy_pass http://localhost:3000;
        proxy_no_cache 1;
        proxy_cache_bypass 1;
        add_header Cache-Control "private, no-cache, no-store, must-revalidate";
    }

    # 图片缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 启用配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/aiwebsitetools /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## SSL 证书配置

### 使用 Let's Encrypt（免费）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

Certbot 会自动修改 Nginx 配置，添加 SSL 支持。

---

## 首次部署后的初始化

### 1. 创建管理员账户

首次部署后，需要创建管理员账户：

```bash
# 方法 1：通过注册页面
# 访问 https://yourdomain.com/register 注册第一个账户
# 然后通过数据库将其设置为管理员

# 使用 Prisma Studio（推荐）
npx prisma studio
# 在浏览器中打开，找到 User 表，将对应用户的 role 改为 ADMIN

# 或使用 SQL 命令
psql -U aiuser -d aiwebsitetools
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
\q
```

### 2. 配置 AI 提供商

登录管理后台后，需要配置 AI 提供商才能使用 AI 功能：

**步骤**：
1. 登录管理后台：`https://yourdomain.com/admin`
2. 进入 **设置 > AI 配置**
3. 点击 **添加 AI 提供商**
4. 填写提供商信息：
   - **名称**：例如 "OpenAI"
   - **类型**：选择 `openai`/`anthropic`/`google`/`custom`
   - **API 密钥**：输入你的有效 API 密钥（⚠️ 确保密钥有效且未过期）
   - **API 端点**：
     - OpenAI: `https://api.openai.com/v1`
     - Anthropic: `https://api.anthropic.com/v1`
     - Google: `https://generativelanguage.googleapis.com/v1beta/models`
     - Custom: 你的自定义 API 端点
   - **状态**：激活
5. 点击 **添加 AI 模型**
6. 填写模型信息：
   - **名称**：例如 "GPT-4"
   - **模型 ID**：例如 "gpt-4"
   - **提供商**：选择刚创建的提供商
   - **输入价格**：每百万 token 的价格
   - **输出价格**：每百万 token 的价格
   - **状态**：激活
7. 在 **AI 配置** 中设置 **主模型**
8. 保存配置

**支持的 AI 提供商类型**：

| 类型 | 说明 | API 端点示例 |
|------|------|-------------|
| `openai` | OpenAI (GPT-3.5, GPT-4) | `https://api.openai.com/v1` |
| `anthropic` | Anthropic (Claude) | `https://api.anthropic.com/v1` |
| `google` | Google (Gemini) | `https://generativelanguage.googleapis.com/v1beta/models` |
| `custom` | 自定义 API（兼容 OpenAI 格式） | 你的自定义端点 |

### 3. 创建分类和工具

1. 在管理后台创建工具分类
2. 添加工具并编写组件代码
3. 发布工具

---

## 添加工具后的重建流程

### ⚠️ 重要说明

由于 Next.js 的构建机制，在生产环境中添加新工具后，需要重新构建应用才能访问新工具。

### 方案 1：手动重建（推荐）

每次在管理后台添加新工具后，在服务器上运行：

```bash
cd /var/www/aiwebsitetools

# 注意：新添加的工具组件已保存在本地文件系统，无需 git pull
# 如果是通过 Git 提交的代码更新，才需要执行 git pull

# 重新构建
npm run build

# 重启应用
pm2 restart aiwebsitetools
```

**预计时间**: 1-2 分钟

### 方案 2：自动重建（可选）

在 `.env` 文件中启用自动重建：

```env
AUTO_REBUILD=true
```

**工作原理**:
- 添加新工具时，系统会自动触发 `npm run build && pm2 restart aiwebsitetools`
- 构建过程在后台进行
- 完成后自动重启应用（仅重启本项目，不影响其他应用）

**注意事项**:
- ⚠️ 会导致 1-2 分钟的服务中断
- 💡 建议在低流量时段添加工具
- 🔧 确保服务器有足够的内存（至少 2GB）

### 方案 3：使用 CI/CD（最佳实践）

配置 GitHub Actions 或 GitLab CI 自动部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/aiwebsitetools
            git pull
            npm install
            npm run build
            pm2 restart aiwebsitetools
```

---

## 常见问题

### 1. 构建后出现 ChunkLoadError 或 400 错误

**错误信息**:
```
Application error: a client-side exception has occurred
ChunkLoadError: Loading chunk failed
Failed to load resource: the server responded with a status of 400
```

**原因**: 构建后的文件哈希值变化，但浏览器或 Nginx 缓存了旧的文件引用。

**解决方法**:

```bash
# 在服务器上执行以下命令

# 1. 删除旧的构建文件
cd /var/www/aiwebsitetools
rm -rf .next

# 2. 清除 npm 缓存
npm cache clean --force

# 3. 重新构建
npm run build

# 4. 重启应用
pm2 restart aiwebsitetools

# 5. 清除 Nginx 缓存
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

**浏览器端**:
- 按 `Ctrl + Shift + Delete` 清除浏览器缓存
- 或按 `Ctrl + F5` 强制刷新页面

**预防措施**:
- 确保 Nginx 配置中禁用了 HTML 页面缓存（见上面的 Nginx 配置）
- 每次构建后清除 Nginx 缓存

### 2. 添加工具后显示 404

**原因**: 新组件文件未被构建到生产代码中。

**解决方法**:
```bash
npm run build
pm2 restart aiwebsitetools
```

### 2. 构建失败：内存不足

**解决方法**:
```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

或在 `package.json` 中修改构建脚本：
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### 3. 数据库连接失败

**检查项**:
- 数据库服务是否运行
- DATABASE_URL 是否正确
- 数据库用户权限是否正确
- 防火墙是否阻止连接

### 4. PM2 应用崩溃

**查看日志**:
```bash
pm2 logs aiwebsitetools --lines 100
```

**常见原因**:
- 端口被占用
- 环境变量未设置
- 数据库连接失败

### 5. Nginx 502 Bad Gateway

**检查项**:
```bash
# 检查应用是否运行
pm2 status

# 检查端口是否监听
netstat -tlnp | grep 3000

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 6. AI 调用失败：401 Unauthorized

**错误信息**:
```
Failed to load resource: the server responded with a status of 500
无效的令牌 / Invalid API key
```

**原因**: API 密钥无效、过期或未正确配置。

**解决方法**:

1. **检查 API 密钥是否有效**：
   ```bash
   # 运行测试脚本
   node test-ai-call.mjs
   ```

2. **更新 API 密钥**：
   - 登录管理后台：`/admin`
   - 进入 **设置 > AI 配置**
   - 编辑对应的 AI 提供商
   - 更新 API 密钥为有效密钥
   - 保存并测试

3. **验证 API 端点**：
   - 确保 API 端点 URL 正确
   - 对于自定义提供商，确保端点兼容 OpenAI 格式

### 7. 删除工具后组件文件未删除

**说明**: 已在最新版本中修复，删除工具时会自动删除对应的组件文件。

如果遇到旧的孤立文件：
```bash
# 手动清理
cd /var/www/aiwebsitetools/components/tools
ls -la
# 删除不需要的文件
rm ComponentName.tsx
```

---

## 性能优化建议

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. 配置缓存

```nginx
# 在 Nginx 配置中
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

### 3. 使用 CDN

将静态资源（图片、CSS、JS）托管到 CDN，提高加载速度。

---

## 监控和维护

### 1. 设置日志轮转

```bash
sudo nano /etc/logrotate.d/aiwebsitetools
```

```
/var/www/aiwebsitetools/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
}
```

### 2. 定期备份

```bash
# 创建备份脚本
nano /home/deploy/backup.sh
```

```bash
#!/bin/bash
set -e  # 遇到错误立即退出

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
echo "开始备份数据库..."
pg_dump aiwebsitetools > $BACKUP_DIR/db_$DATE.sql

if [ $? -eq 0 ]; then
    echo "数据库备份成功: db_$DATE.sql"
else
    echo "数据库备份失败!" >&2
    exit 1
fi

# 备份上传文件
if [ -d "/var/www/aiwebsitetools/public/uploads" ]; then
    echo "开始备份上传文件..."
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/aiwebsitetools/public/uploads
    echo "上传文件备份成功: uploads_$DATE.tar.gz"
fi

# 删除 30 天前的备份
find $BACKUP_DIR -type f -mtime +30 -delete
echo "清理完成，已删除 30 天前的备份"
```

```bash
# 添加执行权限
chmod +x /home/deploy/backup.sh

# 测试备份脚本
/home/deploy/backup.sh

# 设置定时任务
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /home/deploy/backup.sh
```

### 3. 监控服务状态

```bash
# 使用 PM2 监控
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 更新部署

### 拉取最新代码并更新

```bash
cd /var/www/aiwebsitetools

# 拉取代码
git pull

# 安装新依赖
npm install

# 运行数据库迁移（如有）
npx prisma migrate deploy

# 重新构建
npm run build

# 重启应用
pm2 restart aiwebsitetools
```

---

## 安全建议

1. **定期更新系统和依赖**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm audit fix
   ```

2. **配置防火墙**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **禁用 root SSH 登录**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # 设置: PermitRootLogin no
   sudo systemctl restart sshd
   ```

4. **使用强密码和 SSH 密钥**

5. **定期检查日志**
   ```bash
   sudo tail -f /var/log/auth.log
   pm2 logs
   ```

---

## 支持

如有问题，请查看：
- [项目文档](https://github.com/your-username/aiwebsitetools)
- [Issue 追踪](https://github.com/your-username/aiwebsitetools/issues)

---

**最后更新**: 2025-12-02
