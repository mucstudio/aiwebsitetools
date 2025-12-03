import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/ai-providers
 * 获取所有 AI 提供商列表
 */
export async function GET() {
  try {
    await requireAuth();

    const providers = await prisma.aIProvider.findMany({
      include: {
        models: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 不返回 API Key 给前端，只返回是否已配置
    const safeProviders = providers.map((provider) => ({
      ...provider,
      apiKey: '***', // 隐藏真实 API Key
      hasApiKey: !!provider.apiKey,
    }));

    return NextResponse.json(safeProviders);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch AI providers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai-providers
 * 创建新的 AI 提供商
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { name, type, apiKey, baseUrl, enabled, isDefault, config } = body;

    // 验证必填字段
    if (!name || !type || !apiKey) {
      return NextResponse.json(
        { error: 'Name, type, and apiKey are required' },
        { status: 400 }
      );
    }

    // 如果设置为默认，取消其他提供商的默认状态
    if (isDefault) {
      await prisma.aIProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // 加密 API Key
    const encryptedApiKey = encrypt(apiKey);

    // 创建提供商
    const provider = await prisma.aIProvider.create({
      data: {
        name,
        type,
        apiKey: encryptedApiKey,
        baseUrl: baseUrl || null,
        enabled: enabled !== undefined ? enabled : true,
        isDefault: isDefault || false,
        config: config ? JSON.stringify(config) : null,
      },
      include: {
        models: true,
      },
    });

    return NextResponse.json({
      ...provider,
      apiKey: '***',
      hasApiKey: true,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to create AI provider:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/ai-providers
 * 更新 AI 提供商
 */
export async function PUT(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { id, name, type, apiKey, baseUrl, enabled, isDefault, config } = body;

    if (!id) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // 如果设置为默认，取消其他提供商的默认状态
    if (isDefault) {
      await prisma.aIProvider.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // 准备更新数据
    const updateData: any = {
      name,
      type,
      baseUrl: baseUrl || null,
      enabled: enabled !== undefined ? enabled : true,
      isDefault: isDefault || false,
      config: config ? JSON.stringify(config) : null,
    };

    // 如果提供了新的 API Key，加密并更新
    if (apiKey && apiKey !== '***') {
      updateData.apiKey = encrypt(apiKey);
    }

    // 更新提供商
    const provider = await prisma.aIProvider.update({
      where: { id },
      data: updateData,
      include: {
        models: true,
      },
    });

    return NextResponse.json({
      ...provider,
      apiKey: '***',
      hasApiKey: true,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update AI provider:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/ai-providers
 * 删除 AI 提供商
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    await prisma.aIProvider.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete AI provider:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
