/**
 * 统一的日志管理工具
 * 在生产环境中只输出 error 级别的日志
 * 在开发环境中输出所有级别的日志
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private shouldLog(level: LogLevel): boolean {
    // 生产环境只输出 error
    if (this.isProduction) {
      return level === 'error';
    }
    // 开发环境输出所有
    return this.isDevelopment;
  }

  /**
   * 调试日志 - 仅开发环境
   */
  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * 信息日志 - 仅开发环境
   */
  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * 警告日志 - 仅开发环境
   */
  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * 错误日志 - 开发和生产环境都输出
   */
  error(...args: any[]) {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  }

  /**
   * API 请求日志 - 仅开发环境
   */
  api(method: string, url: string, status?: number) {
    if (this.isDevelopment) {
      const statusText = status ? `(${status})` : '';
      console.log(`[API] ${method} ${url} ${statusText}`);
    }
  }

  /**
   * 静默错误 - 不输出任何日志
   * 用于不需要显示的错误（如用户取消操作等）
   */
  silent() {
    // 什么都不做
  }
}

export const logger = new Logger();
