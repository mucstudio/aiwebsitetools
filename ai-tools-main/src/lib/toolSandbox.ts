/**
 * ToolSandbox - 工具代码安全沙箱
 *
 * 功能：
 * 1. 验证代码安全性
 * 2. 限制API访问
 * 3. 控制资源使用
 * 4. 提供受限的全局对象
 */

interface SandboxConfig {
  allowedAPIs: string[]
  allowedDomains: string[]
  maxExecutionTime: number
  memoryLimit: number
  allowExternalScripts: boolean
  allowExternalStyles: boolean
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ToolSandbox {
  private config: SandboxConfig

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = {
      allowedAPIs: ['fetch', 'localStorage', 'sessionStorage'],
      allowedDomains: [],
      maxExecutionTime: 30000, // 30秒
      memoryLimit: 50 * 1024 * 1024, // 50MB
      allowExternalScripts: false,
      allowExternalStyles: false,
      ...config
    }
  }

  /**
   * 验证组件代码安全性
   */
  validateCode(code: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 1. 检查危险的JavaScript模式
    const dangerousPatterns = [
      {
        pattern: /eval\s*\(/g,
        message: 'eval() is not allowed for security reasons',
        severity: 'error'
      },
      {
        pattern: /Function\s*\(/g,
        message: 'Function constructor is not allowed',
        severity: 'error'
      },
      {
        pattern: /__proto__|constructor\s*\[|prototype\s*\[/g,
        message: 'Prototype manipulation is not allowed',
        severity: 'error'
      },
      {
        pattern: /document\.write/g,
        message: 'document.write() is not recommended',
        severity: 'warning'
      },
      {
        pattern: /innerHTML\s*=/g,
        message: 'Direct innerHTML assignment may cause XSS vulnerabilities. Consider using textContent or React rendering.',
        severity: 'warning'
      },
      {
        pattern: /dangerouslySetInnerHTML/g,
        message: 'dangerouslySetInnerHTML should be used with caution',
        severity: 'warning'
      }
    ]

    for (const { pattern, message, severity } of dangerousPatterns) {
      if (pattern.test(code)) {
        if (severity === 'error') {
          errors.push(message)
        } else {
          warnings.push(message)
        }
      }
    }

    // 2. 检查外部资源导入
    if (!this.config.allowExternalScripts) {
      const externalScriptPattern = /<script[^>]*src\s*=\s*["'](?:https?:)?\/\//gi
      if (externalScriptPattern.test(code)) {
        errors.push('External script loading is not allowed')
      }
    }

    // 3. 检查不安全的导入
    const unsafeImports = [
      {
        pattern: /import\s+.*\s+from\s+['"](?!react|@\/|\.\/|\.\.\/)/g,
        message: 'External package imports are restricted. Only React and local imports are allowed.'
      },
      {
        pattern: /require\s*\(\s*['"](?!react|@\/|\.\/|\.\.\/)/g,
        message: 'External package requires are restricted'
      }
    ]

    for (const { pattern, message } of unsafeImports) {
      if (pattern.test(code)) {
        errors.push(message)
      }
    }

    // 4. 检查可疑的网络请求
    const networkPatterns = [
      /fetch\s*\(/g,
      /XMLHttpRequest/g,
      /axios\./g,
      /\$\.ajax/g
    ]

    let hasNetworkCalls = false
    for (const pattern of networkPatterns) {
      if (pattern.test(code)) {
        hasNetworkCalls = true
        break
      }
    }

    if (hasNetworkCalls) {
      warnings.push('This tool makes network requests. Ensure you trust the source.')
    }

    // 5. 检查localStorage/sessionStorage使用
    if (/localStorage|sessionStorage/.test(code)) {
      warnings.push('This tool uses browser storage')
    }

    // 6. 检查是否有导出的组件
    const hasExport = /export\s+(default|const|function|class)|export\s*\{/.test(code)
    const hasToolComponent = /(?:function|const|class)\s+ToolComponent/.test(code)

    if (!hasExport && !hasToolComponent) {
      errors.push('No component export found. Please export a component named "ToolComponent" or use "export default"')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 创建受限的fetch函数
   */
  createRestrictedFetch() {
    const allowedDomains = this.config.allowedDomains
    const maxExecutionTime = this.config.maxExecutionTime

    return async (url: string | URL, options?: RequestInit): Promise<Response> => {
      try {
        const urlObj = typeof url === 'string' ? new URL(url) : url

        // 检查域名白名单
        if (allowedDomains.length > 0) {
          const isAllowed = allowedDomains.some(
            domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
          )

          if (!isAllowed) {
            throw new Error(`Domain ${urlObj.hostname} is not in the allowed list`)
          }
        }

        // 添加超时控制
        const controller = new AbortController()
        const timeoutId = setTimeout(
          () => controller.abort(),
          maxExecutionTime
        )

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          })
          return response
        } finally {
          clearTimeout(timeoutId)
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout exceeded')
          }
          throw error
        }
        throw new Error('Network request failed')
      }
    }
  }

  /**
   * 创建受限的console对象
   */
  createRestrictedConsole(toolId: number) {
    const prefix = `[Tool ${toolId}]`

    return {
      log: (...args: any[]) => console.log(prefix, ...args),
      error: (...args: any[]) => console.error(prefix, ...args),
      warn: (...args: any[]) => console.warn(prefix, ...args),
      info: (...args: any[]) => console.info(prefix, ...args),
      debug: (...args: any[]) => console.debug(prefix, ...args),
      // 禁用某些方法
      trace: () => console.warn(prefix, 'console.trace() is disabled'),
      clear: () => console.warn(prefix, 'console.clear() is disabled'),
    }
  }

  /**
   * 创建受限的localStorage包装器
   */
  createRestrictedStorage(toolId: number, storageType: 'local' | 'session' = 'local') {
    const storage = storageType === 'local' ? localStorage : sessionStorage
    const prefix = `tool_${toolId}_`

    return {
      getItem: (key: string) => {
        return storage.getItem(prefix + key)
      },
      setItem: (key: string, value: string) => {
        try {
          storage.setItem(prefix + key, value)
        } catch (error) {
          console.error('Storage quota exceeded')
          throw new Error('Storage quota exceeded')
        }
      },
      removeItem: (key: string) => {
        storage.removeItem(prefix + key)
      },
      clear: () => {
        // 只清除该工具的数据
        const keys = Object.keys(storage)
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            storage.removeItem(key)
          }
        })
      },
      get length() {
        return Object.keys(storage).filter(k => k.startsWith(prefix)).length
      },
      key: (index: number) => {
        const keys = Object.keys(storage).filter(k => k.startsWith(prefix))
        return keys[index]?.replace(prefix, '') || null
      }
    }
  }

  /**
   * 创建受限的全局对象
   */
  createRestrictedGlobals(toolId: number) {
    return {
      console: this.createRestrictedConsole(toolId),
      fetch: this.createRestrictedFetch(),
      localStorage: this.createRestrictedStorage(toolId, 'local'),
      sessionStorage: this.createRestrictedStorage(toolId, 'session'),
      // 允许的Web APIs
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Promise,
      Date,
      Math,
      JSON,
      // 禁止某些全局对象
      eval: undefined,
      Function: undefined,
      // 提供工具ID
      __TOOL_ID__: toolId,
    }
  }

  /**
   * 检查代码复杂度（简单的启发式检查）
   */
  checkComplexity(code: string): { score: number; warnings: string[] } {
    const warnings: string[] = []
    let score = 0

    // 检查代码长度
    if (code.length > 50000) {
      score += 3
      warnings.push('Code is very long (>50KB)')
    } else if (code.length > 20000) {
      score += 2
      warnings.push('Code is quite long (>20KB)')
    }

    // 检查嵌套深度
    const maxNesting = this.getMaxNesting(code)
    if (maxNesting > 10) {
      score += 2
      warnings.push('Code has deep nesting levels')
    }

    // 检查循环数量
    const loopCount = (code.match(/\b(for|while|do)\s*\(/g) || []).length
    if (loopCount > 20) {
      score += 2
      warnings.push('Code contains many loops')
    }

    return { score, warnings }
  }

  /**
   * 获取代码最大嵌套深度
   */
  private getMaxNesting(code: string): number {
    let maxDepth = 0
    let currentDepth = 0

    for (const char of code) {
      if (char === '{') {
        currentDepth++
        maxDepth = Math.max(maxDepth, currentDepth)
      } else if (char === '}') {
        currentDepth--
      }
    }

    return maxDepth
  }

  /**
   * 完整的安全检查
   */
  performSecurityCheck(code: string): {
    passed: boolean
    validation: ValidationResult
    complexity: { score: number; warnings: string[] }
  } {
    const validation = this.validateCode(code)
    const complexity = this.checkComplexity(code)

    return {
      passed: validation.isValid && complexity.score < 5,
      validation,
      complexity
    }
  }
}

/**
 * 默认沙箱实例
 */
export const defaultSandbox = new ToolSandbox({
  allowedDomains: [], // 可以在这里配置允许的API域名
  maxExecutionTime: 30000,
  allowExternalScripts: false,
  allowExternalStyles: false
})

/**
 * 快捷验证函数
 */
export function validateToolCode(code: string): ValidationResult {
  return defaultSandbox.validateCode(code)
}

/**
 * 快捷安全检查函数
 */
export function performToolSecurityCheck(code: string) {
  return defaultSandbox.performSecurityCheck(code)
}
