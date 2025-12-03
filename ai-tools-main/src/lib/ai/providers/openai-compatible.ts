import OpenAI from 'openai';
import {
  BaseAIProvider,
  AIMessage,
  AIResponse,
  AIModelInfo,
  ChatOptions,
  ProviderConfig,
} from './base';

/**
 * OpenAI 兼容接口提供商适配器
 * 适用于所有兼容 OpenAI API 格式的服务
 */
export class OpenAICompatibleProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);

    if (!this.baseUrl) {
      throw new Error('baseUrl is required for OpenAI-compatible provider');
    }

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-3.5-turbo',
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
      });

      const choice = response.choices[0];
      if (!choice) {
        throw new Error('No response choices from API');
      }

      if (!choice.message) {
        throw new Error('No message in response choice');
      }

      const content = choice.message.content;

      // 检查内容是否为空
      if (content === null || content === undefined) {
        if (choice.finish_reason === 'content_filter') {
          throw new Error('Response blocked by content filter');
        } else if (choice.finish_reason === 'length') {
          throw new Error('Response truncated due to length limit');
        }
        throw new Error(`Model returned null/undefined content. Finish reason: ${choice.finish_reason || 'unknown'}`);
      }

      if (typeof content === 'string' && content.trim().length === 0) {
        throw new Error(`Model returned empty content. Finish reason: ${choice.finish_reason || 'unknown'}`);
      }

      return {
        content: content,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(`OpenAI-compatible API error: ${error.message}`);
    }
  }

  async listModels(): Promise<AIModelInfo[]> {
    try {
      const response = await this.client.models.list();
      return response.data.map((model) => ({
        id: model.id,
        name: model.id,
        description: `${model.id}`,
      }));
    } catch (error: any) {
      throw new Error(`Failed to list models: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  getProviderName(): string {
    return 'OpenAI Compatible';
  }
}
