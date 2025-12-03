'use client'

import React, { useEffect, useState, useMemo } from 'react'
import * as Babel from '@babel/standalone'

interface ToolRuntimeProps {
  componentCode: string
  styleCode?: string
  configJson?: string
  toolId: number
  onError?: (error: Error) => void
}

/**
 * ToolRuntime - 动态加载和执行React组件的运行时环境
 *
 * 功能：
 * 1. 编译TypeScript/JSX代码为可执行的JavaScript
 * 2. 在安全的作用域内执行组件代码
 * 3. 注入样式到页面
 * 4. 错误处理和展示
 */
export function ToolRuntime({
  componentCode,
  styleCode,
  configJson,
  toolId,
  onError
}: ToolRuntimeProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 解析配置
  const config = useMemo(() => {
    if (!configJson) return {}
    try {
      return JSON.parse(configJson)
    } catch {
      return {}
    }
  }, [configJson])

  // 编译和加载组件
  useEffect(() => {
    let isMounted = true

    const loadComponent = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 1. 预处理代码：移除import语句
        let processedCode = componentCode

        // 移除所有import语句（因为我们会通过作用域注入依赖）
        processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, '')
        processedCode = processedCode.replace(/import\s+['"].*?['"]\s*;?/g, '')

        // 移除export default和export关键字，但保留函数/组件定义
        processedCode = processedCode.replace(/export\s+default\s+/g, '')
        processedCode = processedCode.replace(/export\s+/g, '')

        // 2. 编译TypeScript/JSX代码
        const transformedCode = Babel.transform(processedCode, {
          presets: [
            ['react', {
              runtime: 'classic',  // 使用经典模式，不生成import语句
              pragma: 'React.createElement',
              pragmaFrag: 'React.Fragment'
            }],
            'typescript'
          ],
          filename: `tool-${toolId}.tsx`
        }).code

        if (!transformedCode) {
          throw new Error('Failed to compile component code')
        }

        // 3. 创建模块作用域，注入必要的依赖
        const moduleScope = {
          React,
          useState: React.useState,
          useEffect: React.useEffect,
          useMemo: React.useMemo,
          useCallback: React.useCallback,
          useRef: React.useRef,
          useContext: React.useContext,
          // React的JSX运行时
          jsx: React.createElement,
          jsxs: React.createElement,
          Fragment: React.Fragment,
          // 可以在这里添加更多允许的依赖
          console: {
            log: (...args: any[]) => console.log(`[Tool ${toolId}]`, ...args),
            error: (...args: any[]) => console.error(`[Tool ${toolId}]`, ...args),
            warn: (...args: any[]) => console.warn(`[Tool ${toolId}]`, ...args),
            info: (...args: any[]) => console.info(`[Tool ${toolId}]`, ...args),
          },
          // 传递配置给组件
          __TOOL_CONFIG__: config,
          // 用户信息 API - 供工具访问当前登录用户的信息
          UserAPI: {
            getUserProfile: async () => {
              try {
                const response = await fetch('/api/user/profile-data')
                const data = await response.json()
                return data.authenticated ? data.user : null
              } catch (error) {
                console.error('Failed to fetch user profile:', error)
                return null
              }
            },
            isUserLoggedIn: async () => {
              try {
                const response = await fetch('/api/user/profile-data')
                const data = await response.json()
                return data.authenticated
              } catch {
                return false
              }
            },
            getUserBasicInfo: async () => {
              try {
                const response = await fetch('/api/user/profile-data')
                const data = await response.json()
                if (!data.authenticated || !data.user) return null
                const user = data.user
                return {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  city: user.city,
                  country: user.country,
                  address: user.address
                }
              } catch {
                return null
              }
            },
            getUserSocialMedia: async () => {
              try {
                const response = await fetch('/api/user/profile-data')
                const data = await response.json()
                return data.authenticated ? data.user?.socialMedia : null
              } catch {
                return null
              }
            },
            formatUserInfoForAI: async (options: {
              includeBasicInfo?: boolean
              includeSocialMedia?: boolean
              includeBio?: boolean
            } = {}) => {
              try {
                const response = await fetch('/api/user/profile-data')
                const data = await response.json()
                if (!data.authenticated || !data.user) {
                  return 'User is not logged in.'
                }
                const user = data.user
                const {
                  includeBasicInfo = true,
                  includeSocialMedia = true,
                  includeBio = true
                } = options
                let info = []
                if (includeBasicInfo) {
                  info.push('User Information:')
                  if (user.name) info.push(`- Name: ${user.name}`)
                  if (user.email) info.push(`- Email: ${user.email}`)
                  if (user.phone) info.push(`- Phone: ${user.phone}`)
                  if (user.city || user.country) {
                    const location = [user.city, user.country].filter(Boolean).join(', ')
                    info.push(`- Location: ${location}`)
                  }
                  if (user.address) info.push(`- Address: ${user.address}`)
                }
                if (includeSocialMedia && user.socialMedia) {
                  const social = user.socialMedia
                  const socialLinks = []
                  if (social.tiktok) socialLinks.push(`TikTok: ${social.tiktok}`)
                  if (social.instagram) socialLinks.push(`Instagram: ${social.instagram}`)
                  if (social.facebook) socialLinks.push(`Facebook: ${social.facebook}`)
                  if (social.twitter) socialLinks.push(`Twitter: ${social.twitter}`)
                  if (social.youtube) socialLinks.push(`YouTube: ${social.youtube}`)
                  if (social.linkedin) socialLinks.push(`LinkedIn: ${social.linkedin}`)
                  if (social.website) socialLinks.push(`Website: ${social.website}`)
                  if (socialLinks.length > 0) {
                    info.push('\nSocial Media:')
                    socialLinks.forEach(link => info.push(`- ${link}`))
                  }
                }
                if (includeBio && user.bio) {
                  info.push(`\nBio: ${user.bio}`)
                }
                return info.join('\n')
              } catch {
                return 'Failed to fetch user information.'
              }
            }
          },
        }

        // 4. 在安全的作用域内执行代码
        const ComponentFactory = new Function(
          ...Object.keys(moduleScope),
          `
          'use strict';
          ${transformedCode}

          // 查找导出的组件
          if (typeof ToolComponent !== 'undefined') {
            return ToolComponent;
          }

          // 尝试查找任何函数组件
          const possibleComponents = Object.keys(this).filter(key =>
            typeof this[key] === 'function' &&
            key[0] === key[0].toUpperCase() &&
            key !== 'ToolComponent'
          );

          if (possibleComponents.length > 0) {
            return this[possibleComponents[0]];
          }

          throw new Error('No component found. Please export a component named "ToolComponent" or use "export default"');
          `
        )

        const LoadedComponent = ComponentFactory.call({}, ...Object.values(moduleScope))

        if (isMounted) {
          setComponent(() => LoadedComponent)
          setError(null)
        }
      } catch (err) {
        const error = err as Error
        console.error('Tool loading error:', error)

        if (isMounted) {
          setError(error)
          onError?.(error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadComponent()

    return () => {
      isMounted = false
    }
  }, [componentCode, toolId, config, onError])

  // 注入样式
  useEffect(() => {
    if (!styleCode) return

    const styleId = `tool-style-${toolId}`
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.setAttribute('data-tool-id', String(toolId))
      document.head.appendChild(styleElement)
    }

    // 添加作用域前缀，避免样式冲突
    const scopedStyles = styleCode.replace(
      /([^{}]+)\{/g,
      (match, selector) => {
        // 跳过 @media, @keyframes 等规则
        if (selector.trim().startsWith('@')) {
          return match
        }
        // 为选择器添加作用域
        return `[data-tool-container="${toolId}"] ${selector.trim()} {`
      }
    )

    styleElement.textContent = scopedStyles

    return () => {
      styleElement?.remove()
    }
  }, [styleCode, toolId])

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading tool...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Tool Loading Error
              </h3>
              <p className="text-sm text-red-700 mb-3">
                Failed to load this tool. Please contact the administrator if this problem persists.
              </p>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-red-700 bg-red-100 p-3 rounded overflow-auto max-h-64">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染组件
  if (!Component) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">No component to render</p>
        </div>
      </div>
    )
  }

  return (
    <div
      data-tool-container={toolId}
      className="tool-runtime-container"
    >
      <Component />
    </div>
  )
}

/**
 * ToolRuntimeWrapper - 带错误边界的包装器
 */
export class ToolRuntimeErrorBoundary extends React.Component<
  { children: React.ReactNode; toolId: number },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; toolId: number }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tool Runtime Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Tool Runtime Error
            </h3>
            <p className="text-sm text-red-700 mb-3">
              An error occurred while running this tool.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-700 bg-red-100 p-3 rounded overflow-auto">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
