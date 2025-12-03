import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { AIProviderFactory, ProviderType } from './factory';
import { BaseAIProvider, AIMessage, AIResponse, ChatOptions } from './providers/base';

/**
 * AI 服务类
 * 提供统一的 AI 调用接口
 */
export class AIService {
  private provider: BaseAIProvider;
  private modelId?: string;

  constructor(provider: BaseAIProvider, modelId?: string) {
    this.provider = provider;
    this.modelId = modelId;
  }

  /**
   * 发送聊天消息
   */
  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    const chatOptions = {
      ...options,
      model: options?.model || this.modelId,
    };
    return this.provider.chat(messages, chatOptions);
  }

  /**
   * 获取提供商实例
   */
  getProvider(): BaseAIProvider {
    return this.provider;
  }
}

/**
 * 从数据库获取默认的 AI 服务
 * 优先使用全局默认模型（SiteConfig.defaultAIModelId）
 * 如果没有设置全局默认模型，则按顺序使用所有可用模型作为备用
 */
export async function getDefaultAIService(): Promise<AIService> {
  // 1. 优先查找全局默认模型
  const siteConfig = await prisma.siteConfig.findFirst();

  if (siteConfig?.defaultAIModelId) {
    // 根据全局默认模型 ID 查找模型和提供商
    const defaultModel = await prisma.aIModel.findUnique({
      where: { id: siteConfig.defaultAIModelId },
      include: {
        provider: true,
      },
    });

    if (defaultModel && defaultModel.enabled && defaultModel.provider.enabled) {
      // 解密 API Key
      const apiKey = decrypt(defaultModel.provider.apiKey);

      // 解析额外配置
      const config = defaultModel.provider.config
        ? JSON.parse(defaultModel.provider.config)
        : {};

      // 创建提供商实例
      const provider = AIProviderFactory.createProvider(
        defaultModel.provider.type as ProviderType,
        {
          apiKey,
          baseUrl: defaultModel.provider.baseUrl || undefined,
          ...config,
        }
      );

      return new AIService(provider, defaultModel.modelId);
    }
  }

  // 2. 如果没有全局默认模型，获取所有可用的模型作为备用
  // 按照提供商和模型的创建时间排序，第一个作为默认，其他作为备用
  const providers = await prisma.aIProvider.findMany({
    where: {
      enabled: true,
    },
    include: {
      models: {
        where: {
          enabled: true,
        },
        orderBy: {
          createdAt: 'asc', // 按创建时间排序，先创建的优先
        },
      },
    },
    orderBy: {
      createdAt: 'asc', // 按创建时间排序
    },
  });

  // 收集所有可用的模型
  const availableModels = providers.flatMap(provider =>
    provider.models.map(model => ({
      model,
      provider,
    }))
  );

  if (availableModels.length === 0) {
    throw new Error('No AI models available. Please add a provider and fetch models in AI Configuration.');
  }

  // 使用第一个可用的模型
  const { model: firstModel, provider: firstProvider } = availableModels[0];

  // 解密 API Key
  const apiKey = decrypt(firstProvider.apiKey);

  // 解析额外配置
  const config = firstProvider.config ? JSON.parse(firstProvider.config) : {};

  // 创建提供商实例
  const provider = AIProviderFactory.createProvider(firstProvider.type as ProviderType, {
    apiKey,
    baseUrl: firstProvider.baseUrl || undefined,
    ...config,
  });

  return new AIService(provider, firstModel.modelId);
}

/**
 * 获取所有可用的 AI 模型（用于故障转移）
 * 返回按优先级排序的模型列表：全局默认模型 > 手动指定的备用模型1-3
 */
export async function getAllAvailableAIServices(): Promise<AIService[]> {
  const services: AIService[] = [];

  // 1. 获取全局默认模型和备用模型配置
  const siteConfig = await prisma.siteConfig.findFirst();

  // 按优先级顺序：默认模型 -> 备用1 -> 备用2 -> 备用3
  const modelIds = [
    siteConfig?.defaultAIModelId,
    siteConfig?.backupAIModelId1,
    siteConfig?.backupAIModelId2,
    siteConfig?.backupAIModelId3,
  ].filter((id): id is number => id !== null && id !== undefined);

  if (modelIds.length === 0) {
    throw new Error('No AI models configured. Please set default and backup models in AI Configuration.');
  }

  // 2. 按顺序获取每个模型并创建服务
  for (const modelId of modelIds) {
    try {
      const model = await prisma.aIModel.findUnique({
        where: { id: modelId },
        include: {
          provider: true,
        },
      });

      // 跳过不存在或未启用的模型
      if (!model || !model.enabled || !model.provider.enabled) {
        console.warn(`Model ${modelId} is not available, skipping...`);
        continue;
      }

      // 解密 API Key
      const apiKey = decrypt(model.provider.apiKey);

      // 解析额外配置
      const config = model.provider.config ? JSON.parse(model.provider.config) : {};

      // 创建提供商实例
      const providerInstance = AIProviderFactory.createProvider(
        model.provider.type as ProviderType,
        {
          apiKey,
          baseUrl: model.provider.baseUrl || undefined,
          ...config,
        }
      );

      services.push(new AIService(providerInstance, model.modelId));
    } catch (error) {
      console.error(`Failed to create service for model ${modelId}:`, error);
      // 跳过创建失败的服务，继续处理下一个
    }
  }

  if (services.length === 0) {
    throw new Error('No AI services available. Please check your model configuration.');
  }

  return services;
}

/**
 * 带故障转移的 AI 调用
 * 自动尝试所有可用的模型，直到成功或全部失败
 */
export async function chatWithFailover(
  messages: AIMessage[],
  options?: ChatOptions
): Promise<AIResponse> {
  const services = await getAllAvailableAIServices();

  if (services.length === 0) {
    throw new Error('No AI services available');
  }

  const errors: string[] = [];

  // 依次尝试每个服务
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    try {
      console.log(`Trying AI service ${i + 1}/${services.length}...`);
      const response = await service.chat(messages, options);

      // 如果不是第一个服务成功，记录日志
      if (i > 0) {
        console.log(`Failover successful: used backup service ${i + 1}`);
      }

      return response;
    } catch (error: any) {
      const errorMsg = `Service ${i + 1} failed: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);

      // 如果不是最后一个服务，继续尝试下一个
      if (i < services.length - 1) {
        console.log(`Trying next backup service...`);
        continue;
      }
    }
  }

  // 所有服务都失败了
  throw new Error(
    `All AI services failed. Errors:\n${errors.join('\n')}`
  );
}

/**
 * 从数据库获取指定的 AI 服务
 */
export async function getAIServiceById(providerId: number, modelId?: string): Promise<AIService> {
  const provider = await prisma.aIProvider.findUnique({
    where: { id: providerId },
    include: {
      models: true,
    },
  });

  if (!provider) {
    throw new Error(`AI provider with id ${providerId} not found`);
  }

  if (!provider.enabled) {
    throw new Error(`AI provider ${provider.name} is disabled`);
  }

  // 解密 API Key
  const apiKey = decrypt(provider.apiKey);

  // 解析额外配置
  const config = provider.config ? JSON.parse(provider.config) : {};

  // 创建提供商实例
  const providerInstance = AIProviderFactory.createProvider(provider.type as ProviderType, {
    apiKey,
    baseUrl: provider.baseUrl || undefined,
    ...config,
  });

  // 如果指定了模型 ID，验证该模型是否存在且启用
  if (modelId) {
    const model = provider.models.find((m) => m.modelId === modelId && m.enabled);
    if (!model) {
      throw new Error(`Model ${modelId} not found or disabled`);
    }
  }

  return new AIService(providerInstance, modelId);
}

/**
 * 获取所有可用的 AI 提供商
 */
export async function getAvailableProviders() {
  return prisma.aIProvider.findMany({
    where: { enabled: true },
    include: {
      models: {
        where: { enabled: true },
      },
    },
  });
}

/**
 * 测试 AI 提供商连接
 */
export async function testProviderConnection(
  type: ProviderType,
  apiKey: string,
  baseUrl?: string
): Promise<boolean> {
  try {
    const provider = AIProviderFactory.createProvider(type, {
      apiKey,
      baseUrl,
    });
    return await provider.testConnection();
  } catch (error) {
    console.error('Provider connection test failed:', error);
    return false;
  }
}
