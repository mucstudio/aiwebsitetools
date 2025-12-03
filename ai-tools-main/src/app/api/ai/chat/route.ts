import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService, getAIServiceById } from '@/lib/ai/service';
import { AIMessage } from '@/lib/ai/providers/base';
import { getSession } from '@/lib/auth';
import { getUserSession } from '@/lib/userAuth';

/**
 * POST /api/ai/chat
 * 统一的 AI 聊天接口
 *
 * 支持三种调用方式：
 * 1. 管理员调用（已登录管理后台）- 无限制
 * 2. 普通用户调用（已注册登录）- 根据订阅计划限制
 * 3. 访客调用（未登录）- 根据全局配置限制
 *
 * Body:
 * {
 *   messages: AIMessage[],
 *   providerId?: number,  // 可选，指定提供商 ID
 *   modelId?: string,     // 可选，指定模型 ID
 *   temperature?: number,
 *   maxTokens?: number,
 *   fingerprint?: string  // 访客必需，用于使用限制追踪
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 检查用户身份（管理员 > 普通用户 > 访客）
    const adminId = await getSession();
    const userId = await getUserSession();

    const body = await request.json();
    const { messages, providerId, modelId, temperature, maxTokens, fingerprint } = body;

    // 验证消息格式
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages must be a non-empty array' },
        { status: 400 }
      );
    }

    // 验证消息结构
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          { error: 'Each message must have role and content' },
          { status: 400 }
        );
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        return NextResponse.json(
          { error: 'Invalid message role. Must be system, user, or assistant' },
          { status: 400 }
        );
      }
    }

    // 如果不是管理员，需要检查使用限制
    if (!adminId) {
      // 访客用户必须提供fingerprint
      if (!userId && !fingerprint) {
        return NextResponse.json(
          { error: 'Fingerprint is required for guest users' },
          { status: 400 }
        );
      }

      // 注意：这里不做使用限制检查，由前端在调用AI前先调用 /api/usage/check
      // AI调用成功后，前端需要调用 /api/usage/record 记录使用
      // 这样可以避免AI调用失败但仍然扣除次数的问题
    }

    // 获取 AI 服务
    let aiService;
    if (providerId) {
      aiService = await getAIServiceById(providerId, modelId);
    } else {
      aiService = await getDefaultAIService();
    }

    // 调用 AI 服务
    const response = await aiService.chat(messages as AIMessage[], {
      model: modelId,
      temperature,
      maxTokens,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
