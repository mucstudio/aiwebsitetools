#!/bin/bash

# 生产服务器部署脚本
# 修复 AI 调用和使用次数扣减问题

set -e  # 遇到错误立即退出

echo "🚀 开始部署到生产服务器..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 提交本地修改到 Git
echo -e "${YELLOW}📝 步骤 1: 提交本地修改到 Git${NC}"
git add app/api/ai/call/route.ts
git commit -m "Fix: API key decryption, usage tracking, and toolId lookup

- Add API key decryption for AI provider calls
- Fix usage limit tracking using unified service
- Add support for toolId lookup by slug or ID
- Fix usage record creation for tools like 'aura-check'

Changes:
- Import decryptApiKey, checkUsageLimit, getCurrentSession, getClientIP
- Add toolId lookup by slug or ID before recording usage
- Use decryptApiKey() when calling AI providers
- Replace hardcoded daily limit with unified usage limit service
- Fix usage record creation with correct toolId

This fixes the following issues:
1. 'Invalid token' error on production server
2. Usage count not decreasing after AI calls
3. Usage records not being created in database"

echo -e "${GREEN}✅ Git 提交完成${NC}"
echo ""

# 2. 推送到远程仓库
echo -e "${YELLOW}📤 步骤 2: 推送到远程仓库${NC}"
git push
echo -e "${GREEN}✅ 推送完成${NC}"
echo ""

# 3. 生成服务器部署命令
echo -e "${YELLOW}📋 步骤 3: 生成服务器部署命令${NC}"
echo ""
echo "请在生产服务器上执行以下命令："
echo ""
echo -e "${GREEN}# SSH 登录服务器${NC}"
echo "ssh root@your-server"
echo ""
echo -e "${GREEN}# 进入项目目录${NC}"
echo "cd /root/aiwebsitetools"
echo ""
echo -e "${GREEN}# 拉取最新代码${NC}"
echo "git pull"
echo ""
echo -e "${GREEN}# 重新生成 Prisma Client${NC}"
echo "npx prisma generate"
echo ""
echo -e "${GREEN}# 重新构建项目${NC}"
echo "npm run build"
echo ""
echo -e "${GREEN}# 重启应用${NC}"
echo "pm2 restart aiwebsitetools"
echo ""
echo -e "${GREEN}# 清除缓存${NC}"
echo "rm -rf .next/cache"
echo "sudo rm -rf /var/cache/nginx/*"
echo "sudo systemctl reload nginx"
echo ""
echo -e "${GREEN}# 查看应用日志（可选）${NC}"
echo "pm2 logs aiwebsitetools --lines 50"
echo ""

echo -e "${YELLOW}📝 部署验证步骤：${NC}"
echo ""
echo "1. 访问 https://inspoaibox.com/tools/aura-check"
echo "2. 检查初始显示的剩余次数（应该是 50 次）"
echo "3. 输入测试文本并点击 'Calculate Aura'"
echo "4. 检查 AI 是否正常返回结果"
echo "5. 检查剩余次数是否变为 49 次"
echo "6. 刷新页面，确认剩余次数保持为 49 次"
echo ""

echo -e "${GREEN}✅ 部署脚本执行完成！${NC}"
echo ""
echo -e "${YELLOW}⚠️  注意：请按照上面的命令在服务器上完成部署${NC}"
