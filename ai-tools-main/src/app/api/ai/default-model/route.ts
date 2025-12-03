import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/ai/default-model
 * 获取全局默认模型和备用模型
 */
export async function GET() {
  try {
    await requireAuth();

    const siteConfig = await prisma.siteConfig.findFirst();

    return NextResponse.json({
      defaultModelId: siteConfig?.defaultAIModelId || null,
      backupModelId1: siteConfig?.backupAIModelId1 || null,
      backupModelId2: siteConfig?.backupAIModelId2 || null,
      backupModelId3: siteConfig?.backupAIModelId3 || null,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to get default model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai/default-model
 * 设置全局默认模型和备用模型
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    let { defaultModelId, backupModelId1, backupModelId2, backupModelId3 } = body;

    // 将 undefined 转换为 null
    backupModelId1 = backupModelId1 === undefined ? null : backupModelId1;
    backupModelId2 = backupModelId2 === undefined ? null : backupModelId2;
    backupModelId3 = backupModelId3 === undefined ? null : backupModelId3;

    // 验证至少有默认模型
    if (!defaultModelId) {
      return NextResponse.json(
        { error: 'Default model ID is required' },
        { status: 400 }
      );
    }

    // 验证默认模型是否存在
    const defaultModel = await prisma.aIModel.findUnique({
      where: { id: defaultModelId },
    });

    if (!defaultModel) {
      return NextResponse.json({ error: 'Default model not found' }, { status: 404 });
    }

    // 验证备用模型（如果提供）
    const backupIds = [backupModelId1, backupModelId2, backupModelId3].filter(
      (id): id is number => id !== null && id !== undefined
    );

    for (const backupId of backupIds) {
      const backupModel = await prisma.aIModel.findUnique({
        where: { id: backupId },
      });
      if (!backupModel) {
        return NextResponse.json(
          { error: `Backup model ${backupId} not found` },
          { status: 404 }
        );
      }
    }

    // 更新或创建站点配置
    const siteConfig = await prisma.siteConfig.findFirst();

    const updateData = {
      defaultAIModelId: defaultModelId,
      backupAIModelId1: backupModelId1 || null,
      backupAIModelId2: backupModelId2 || null,
      backupAIModelId3: backupModelId3 || null,
    };

    if (siteConfig) {
      await prisma.siteConfig.update({
        where: { id: siteConfig.id },
        data: updateData,
      });
    } else {
      await prisma.siteConfig.create({
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to set models:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
