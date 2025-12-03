import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { requireAuth } from '@/lib/auth';
import { testProviderConnection } from '@/lib/ai/service';
import { ProviderType } from '@/lib/ai/factory';

/**
 * POST /api/ai-providers/[id]/test
 * 测试 AI 提供商连接
 */
export async function POST(
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
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // 解密 API Key
    const apiKey = decrypt(provider.apiKey);

    // 测试连接
    const success = await testProviderConnection(
      provider.type as ProviderType,
      apiKey,
      provider.baseUrl || undefined
    );

    return NextResponse.json({
      success,
      message: success ? 'Connection successful' : 'Connection failed',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to test provider connection:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
