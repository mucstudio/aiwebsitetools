#!/bin/bash

# 自动重新构建脚本
# 当检测到 components/tools/ 目录有变化时自动重新构建

echo "🔍 监听 components/tools/ 目录变化..."

# 使用 inotifywait 监听文件变化（Linux）
# 或使用 fswatch（macOS）

if command -v inotifywait &> /dev/null; then
    # Linux
    while inotifywait -e modify,create,delete -r components/tools/; do
        echo "📦 检测到文件变化，开始重新构建..."
        npm run build
        echo "✅ 构建完成"

        # 如果使用 PM2，重启应用
        if command -v pm2 &> /dev/null; then
            pm2 restart all
            echo "🔄 应用已重启"
        fi
    done
elif command -v fswatch &> /dev/null; then
    # macOS
    fswatch -o components/tools/ | while read; do
        echo "📦 检测到文件变化，开始重新构建..."
        npm run build
        echo "✅ 构建完成"

        # 如果使用 PM2，重启应用
        if command -v pm2 &> /dev/null; then
            pm2 restart all
            echo "🔄 应用已重启"
        fi
    done
else
    echo "❌ 请安装 inotifywait (Linux) 或 fswatch (macOS)"
    exit 1
fi
