import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  BaseAIProvider,
  AIMessage,
  AIResponse,
  AIModelInfo,
  ChatOptions,
  ProviderConfig,
} from './base';

/**
 * Gemini 提供商适配器
 */
export class GeminiProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    try {
      const modelName = options?.model || 'gemini-pro';
      const model = this.client.getGenerativeModel({
        model: modelName,
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT' as any,
            threshold: 'BLOCK_NONE' as any,
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH' as any,
            threshold: 'BLOCK_NONE' as any,
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any,
            threshold: 'BLOCK_NONE' as any,
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any,
            threshold: 'BLOCK_NONE' as any,
          },
        ],
      });

      // 将消息转换为 Gemini 格式
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history: history.length > 0 ? history : undefined,
        generationConfig: {
          temperature: options?.temperature,
          maxOutputTokens: options?.maxTokens,
        },
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;

      // 检查响应是否被安全过滤器阻止
      const candidates = (response as any).candidates;
      if (candidates && candidates.length > 0) {
        const candidate = candidates[0];
        const finishReason = candidate.finishReason;

        if (finishReason === 'SAFETY') {
          const safetyRatings = candidate.safetyRatings || [];
          const blockedReasons = safetyRatings
            .filter((rating: any) => rating.blocked)
            .map((rating: any) => rating.category)
            .join(', ');
          throw new Error(`Response blocked by safety filter: ${blockedReasons || 'Unknown reason'}`);
        }

        if (finishReason === 'RECITATION') {
          throw new Error('Response blocked due to recitation concerns');
        }
      }

      const text = response.text();

      // 如果响应为空，提供更详细的错误信息
      if (!text || text.trim().length === 0) {
        throw new Error(`Model returned empty response. This may be due to safety filters or model limitations. Model: ${modelName}`);
      }

      return {
        content: text,
        model: modelName,
        usage: {
          promptTokens: 0, // Gemini 不提供详细的 token 统计
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      throw new Error(`Gemini API error: ${errorMessage}`);
    }
  }

  async listModels(): Promise<AIModelInfo[]> {
    try {
      // 使用 Google Gemini REST API 获取模型列表
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 过滤出支持 generateContent 的模型
      return data.models
        .filter((model: any) =>
          model.supportedGenerationMethods?.includes('generateContent')
        )
        .map((model: any) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.name.replace('models/', ''),
          description: model.description || `Google ${model.displayName || model.name}`,
        }));
    } catch (error: any) {
      // 如果 API 调用失败，返回预设的模型列表作为后备
      return [
        { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google Gemini Pro' },
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Google Gemini Pro Vision' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Google Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Google Gemini 1.5 Flash' },
        { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro Latest', description: 'Google Gemini 1.5 Pro (Latest)' },
        { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash Latest', description: 'Google Gemini 1.5 Flash (Latest)' },
      ];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('test');
      return !!result.response;
    } catch (error) {
      return false;
    }
  }

  getProviderName(): string {
    return 'Gemini';
  }
}
