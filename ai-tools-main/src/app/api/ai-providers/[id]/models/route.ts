import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { requireAuth } from '@/lib/auth';
import { AIProviderFactory, ProviderType } from '@/lib/ai/factory';

/**
 * GET /api/ai-providers/[id]/models
 * 获取提供商的可用模型列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const providerId = parseInt(params.id);

    // 获取提供商信息
    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // 解密 API Key
    const apiKey = decrypt(provider.apiKey);

    // 创建提供商实例
    const providerInstance = AIProviderFactory.createProvider(
      provider.type as ProviderType,
      {
        apiKey,
        baseUrl: provider.baseUrl || undefined,
      }
    );

    // 获取模型列表
    const models = await providerInstance.listModels();

    return NextResponse.json(models);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch models:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai-providers/[id]/models
 * 保存模型列表到数据库
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const providerId = parseInt(params.id);
    const body = await request.json();
    const { models } = body;

    if (!Array.isArray(models)) {
      return NextResponse.json(
        { error: 'Models must be an array' },
        { status: 400 }
      );
    }

    // 删除现有模型
    await prisma.aIModel.deleteMany({
      where: { providerId },
    });

    // 创建新模型
    const createdModels = await Promise.all(
      models.map((model: any, index: number) =>
        prisma.aIModel.create({
          data: {
            providerId,
            modelId: model.id,
            displayName: model.name,
            enabled: model.enabled !== undefined ? model.enabled : true,
            isDefault: model.isDefault !== undefined ? model.isDefault : index === 0,
            capabilities: model.capabilities
              ? JSON.stringify(model.capabilities)
              : null,
          },
        })
      )
    );

    return NextResponse.json(createdModels);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to save models:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
