# AI Website Tools

一个面向海外用户的在线工具平台，支持多种实用工具、用户订阅和管理后台。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 组件**: shadcn/ui + Tailwind CSS
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js v5
- **支付**: Stripe
- **语言**: TypeScript

## 项目结构

```
aiwebsitetools/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   └── auth/           # NextAuth 认证
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/              # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   ├── layout/             # 布局组件 (Header, Footer)
│   ├── tools/              # 工具组件
│   ├── admin/              # 管理后台组件
│   └── pricing/            # 价格页组件
├── lib/                     # 工具库
│   ├── prisma.ts           # Prisma 客户端
│   ├── auth.ts             # NextAuth 配置
│   └── utils.ts            # 工具函数
├── prisma/                  # Prisma 配置
│   └── schema.prisma       # 数据库模型
├── types/                   # TypeScript 类型定义
├── hooks/                   # React Hooks
└── public/                  # 静态资源
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

必需的环境变量：
- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `NEXTAUTH_SECRET`: NextAuth 密钥 (使用 `openssl rand -base64 32` 生成)
- `NEXTAUTH_URL`: 应用 URL (开发环境: http://localhost:3000)

### 3. 设置数据库

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库模式 (开发环境)
npm run db:push

# 或运行迁移 (生产环境)
npm run db:migrate
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run db:generate` - 生成 Prisma 客户端
- `npm run db:push` - 推送数据库模式
- `npm run db:migrate` - 运行数据库迁移
- `npm run db:studio` - 打开 Prisma Studio

## 数据库模型

项目包含以下主要数据模型：

- **User** - 用户账户
- **Account** - OAuth 账户
- **Session** - 用户会话
- **Subscription** - 订阅信息
- **Plan** - 订阅计划
- **Tool** - 工具
- **Category** - 工具分类
- **UsageRecord** - 使用记录
- **Favorite** - 收藏
- **Payment** - 支付记录
- **SiteSettings** - 网站设置

## 核心功能

### 前台功能
- ✅ 首页 (Hero + 功能展示)
- ⏳ 工具列表和分类页
- ⏳ 工具详情页
- ⏳ 用户注册/登录
- ⏳ 用户中心
- ⏳ 订阅价格页
- ⏳ Stripe 支付集成

### 管理后台
- ⏳ Dashboard 概览
- ⏳ 工具管理 (CRUD)
- ⏳ 分类管理
- ⏳ 用户管理
- ⏳ 订阅计划管理
- ⏳ 支付管理
- ⏳ 网站设置

### 预设工具
- ⏳ Word Counter (字数统计)
- ⏳ Image Compressor (图片压缩)
- ⏳ JSON Formatter (JSON 格式化)
- ⏳ Base64 Encoder (Base64 编解码)
- ⏳ QR Code Generator (二维码生成)
- ⏳ Color Converter (颜色转换)

## 部署

### VPS 部署

详细的 VPS 部署指南请查看 [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md)

主要步骤：
1. 配置 Ubuntu 22.04 服务器
2. 安装 Node.js 20 + PostgreSQL 16
3. 配置 Nginx 反向代理
4. 设置 SSL 证书 (Let's Encrypt)
5. 使用 PM2 管理进程
6. 配置 Cloudflare CDN

### Vercel 部署 (可选)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

## OAuth 配置

### Google OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 添加授权重定向 URI: `http://localhost:3000/api/auth/callback/google`
6. 将 Client ID 和 Secret 添加到 `.env.local`

## Stripe 配置

1. 注册 [Stripe](https://stripe.com) 账户
2. 获取 API 密钥 (测试模式)
3. 创建产品和价格
4. 配置 Webhook (用于订阅事件)
5. 将密钥添加到 `.env.local`

## 开发路线图

### Phase 1: 基础功能 ✅
- [x] 项目初始化
- [x] 数据库设计
- [x] 认证系统配置
- [x] 基础布局和首页

### Phase 2: 用户功能 (进行中)
- [ ] 注册/登录页面
- [ ] 用户中心
- [ ] 工具列表页
- [ ] 工具详情页

### Phase 3: 支付集成
- [ ] Stripe 集成
- [ ] 订阅流程
- [ ] 价格页面
- [ ] Webhook 处理

### Phase 4: 管理后台
- [ ] 管理员认证
- [ ] Dashboard
- [ ] 工具管理
- [ ] 用户管理
- [ ] 网站设置

### Phase 5: 工具开发
- [ ] 开发 5-10 个初始工具
- [ ] 工具组件模板系统
- [ ] 使用限制和统计

### Phase 6: 优化上线
- [ ] SEO 优化
- [ ] 性能优化
- [ ] 测试
- [ ] 部署

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- 网站: [待定]
- Email: [待定]
- Twitter: [待定]
