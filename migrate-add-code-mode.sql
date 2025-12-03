-- Migration: Add codeMode field to Tool table
-- Date: 2025-12-03
-- Description: 添加 codeMode 字段以支持 HTML 模式工具

-- 添加 codeMode 字段，默认值为 'react'
ALTER TABLE "Tool" ADD COLUMN "codeMode" TEXT NOT NULL DEFAULT 'react';

-- 添加注释
COMMENT ON COLUMN "Tool"."codeMode" IS '代码模式：react 或 html';

-- 验证迁移
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'Tool'
  AND column_name = 'codeMode';
