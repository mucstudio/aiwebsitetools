/**
 * AI 消息接口
 */
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * AI 响应接口
 */
export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI 模型信息接口
 */
export interface AIModelInfo {
  id: string;
  name: string;
  description?: string;
}

/**
 * 聊天选项接口
 */
export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * AI 提供商配置接口
 */
export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  [key: string]: any;
}

/**
 * AI 提供商基础抽象类
 */
export abstract class BaseAIProvider {
  protected apiKey: string;
  protected baseUrl?: string;
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.config = config;
  }

  /**
   * 发送聊天消息
   * @param messages 消息列表
   * @param options 选项
   * @returns AI 响应
   */
  abstract chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse>;

  /**
   * 获取可用模型列表
   * @returns 模型列表
   */
  abstract listModels(): Promise<AIModelInfo[]>;

  /**
   * 测试连接
   * @returns 是否连接成功
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * 获取提供商名称
   */
  abstract getProviderName(): string;
}
