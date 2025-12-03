import { BaseAIProvider, ProviderConfig } from './providers/base';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { ClaudeProvider } from './providers/claude';
import { ZhipuProvider } from './providers/zhipu';
import { OpenAICompatibleProvider } from './providers/openai-compatible';

/**
 * AI 提供商类型
 */
export type ProviderType = 'openai' | 'gemini' | 'claude' | 'zhipu' | 'openai-compatible';

/**
 * AI 提供商工厂
 */
export class AIProviderFactory {
  /**
   * 创建 AI 提供商实例
   * @param type 提供商类型
   * @param config 配置
   * @returns AI 提供商实例
   */
  static createProvider(type: ProviderType, config: ProviderConfig): BaseAIProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'claude':
        return new ClaudeProvider(config);
      case 'zhipu':
        return new ZhipuProvider(config);
      case 'openai-compatible':
        return new OpenAICompatibleProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  /**
   * 获取所有支持的提供商类型
   */
  static getSupportedTypes(): ProviderType[] {
    return ['openai', 'gemini', 'claude', 'zhipu', 'openai-compatible'];
  }

  /**
   * 获取提供商类型的显示名称
   */
  static getProviderDisplayName(type: ProviderType): string {
    const names: Record<ProviderType, string> = {
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      claude: 'Anthropic Claude',
      zhipu: '智谱AI',
      'openai-compatible': 'OpenAI 兼容接口',
    };
    return names[type] || type;
  }
}
