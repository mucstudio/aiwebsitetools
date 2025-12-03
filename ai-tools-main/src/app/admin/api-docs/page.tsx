'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Copy, Check, Code, BookOpen, Zap } from 'lucide-react'

interface SiteConfig {
  guestUsageLimit: number
  guestResetDays: number
}

export default function AdminApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [config, setConfig] = useState<SiteConfig>({
    guestUsageLimit: 10,
    guestResetDays: 30
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (data.success && data.config) {
        setConfig({
          guestUsageLimit: data.config.guestUsageLimit || 10,
          guestResetDays: data.config.guestResetDays || 30
        })
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const fingerprintCode = `// Enhanced browser fingerprint (prevents bypassing by switching browsers)
function generateFingerprint() {
  try {
    const canvasFingerprint = getCanvasFingerprint();
    const webglFingerprint = getWebGLFingerprint();

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.languages ? navigator.languages.join(',') : '',
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      screen.pixelDepth || screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown',
      navigator.platform,
      navigator.maxTouchPoints || 0,
      screen.availWidth + 'x' + screen.availHeight,
      canvasFingerprint,
      webglFingerprint
    ].join('|');

    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  } catch (error) {
    console.error('Fingerprint generation error:', error);
    return generateFallbackFingerprint();
  }
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#069';
    ctx.fillText('fingerprint', 2, 2);
    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-error';
  }
}

function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return vendor + '~' + renderer;
    }
    return 'webgl-no-debug';
  } catch (e) {
    return 'webgl-error';
  }
}

function generateFallbackFingerprint() {
  try {
    const basicFingerprint = [
      'fallback',
      navigator.userAgent || 'unknown',
      navigator.language || 'unknown',
      screen.width + 'x' + screen.height,
      screen.colorDepth || 24,
      new Date().getTimezoneOffset(),
      navigator.platform || 'unknown'
    ].join('|');
    let hash = 0;
    for (let i = 0; i < basicFingerprint.length; i++) {
      const char = basicFingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'fb-' + Math.abs(hash).toString(36);
  } catch (e) {
    return getPersistentFallbackId();
  }
}

function getPersistentFallbackId() {
  try {
    const storageKey = '_fp_fallback_id';
    let fallbackId = localStorage.getItem(storageKey);
    if (!fallbackId) {
      fallbackId = 'persistent-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(storageKey, fallbackId);
    }
    return fallbackId;
  } catch (e) {
    return 'ultimate-fallback';
  }
}`

  const checkUsageCode = `// Check if user can use the tool
async function checkUsage(toolId) {
  const fingerprint = generateFingerprint();

  const response = await fetch(\`/api/usage/check?toolId=\${toolId}&fingerprint=\${fingerprint}\`);
  const data = await response.json();

  if (!data.allowed) {
    alert(data.message || 'Usage limit reached. Please register for more uses.');
    return false;
  }

  // Show remaining uses
  if (data.remaining > 0 && data.remaining <= 5) {
    console.log(\`You have \${data.remaining} uses remaining\`);
  }

  return true;
}`

  const recordUsageCode = `// Record tool usage
async function recordUsage(toolId) {
  const fingerprint = generateFingerprint();

  const response = await fetch('/api/usage/record', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      toolId: toolId,
      fingerprint: fingerprint
    })
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || 'Usage limit reached');
    return false;
  }

  return true;
}`

  const getToolIdCode = `// Automatically get tool ID (supports iframe and direct page access)
function getToolId() {
  return new Promise((resolve) => {
    // Check if running in iframe
    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      // Listen for tool ID from parent page
      let toolIdReceived = false;

      window.addEventListener('message', (event) => {
        // Security: verify message origin if needed
        // if (event.origin !== 'https://yourdomain.com') return;

        if (event.data && event.data.type === 'TOOL_ID') {
          toolIdReceived = true;
          resolve(event.data.toolId);
        }
      });

      // Timeout fallback: if no message received in 3 seconds, try URL parsing
      setTimeout(() => {
        if (!toolIdReceived) {
          console.warn('Tool ID not received from parent, trying URL parsing...');
          resolve(getToolIdFromUrl());
        }
      }, 3000);
    } else {
      // Not in iframe, get from URL directly
      resolve(getToolIdFromUrl());
    }
  });
}

// Helper function to extract tool ID from URL
function getToolIdFromUrl() {
  // URL format: /tools/[slug]/xxx or /tools/[slug]
  const pathParts = window.location.pathname.split('/');
  const toolsIndex = pathParts.indexOf('tools');

  if (toolsIndex !== -1 && pathParts[toolsIndex + 1]) {
    const slugOrId = pathParts[toolsIndex + 1];
    // Try to parse as integer, if fails it's a slug
    const id = parseInt(slugOrId);
    if (!isNaN(id)) return id;
  }

  // Fallback: try to get from query parameter ?toolId=123
  const urlParams = new URLSearchParams(window.location.search);
  const toolId = urlParams.get('toolId');
  if (toolId) return parseInt(toolId);

  console.error('Unable to detect tool ID from URL');
  return null;
}`

  const completeExampleCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>文本转大写工具 - 示例</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .spinner { border: 2px solid #f3f3f3; border-top: 2px solid #3b82f6; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-3xl mx-auto">
    <!-- 工具标题 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">文本转大写工具</h1>
      <p class="text-gray-600">将您的文本转换为大写字母</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="bg-white rounded-lg shadow-md p-6">

      <!-- ⭐ 剩余次数显示 - 显眼位置 -->
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span class="text-sm font-medium text-blue-900">剩余使用次数</span>
        </div>
        <span id="remaining" class="text-lg font-bold text-blue-600">--</span>
      </div>

      <!-- 输入区域 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
        <textarea
          id="input"
          rows="6"
          placeholder="请输入要转换的文本..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        ></textarea>
      </div>

      <!-- ⭐ 立即生成按钮 - 集成使用限制 -->
      <button
        id="generateBtn"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span id="btnText">立即生成</span>
        <div id="spinner" class="spinner hidden"></div>
      </button>

      <!-- 输出区域 -->
      <div id="output" class="hidden mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">转换结果</label>
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p id="result" class="text-gray-900 whitespace-pre-wrap"></p>
        </div>
        <button
          id="copyBtn"
          class="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
        >
          复制结果
        </button>
      </div>
    </div>
  </div>

  <script>
    // ========== 使用限制追踪集成 ==========

    ${getToolIdCode}

    ${fingerprintCode}

    ${checkUsageCode}

    ${recordUsageCode}

    // ========== 工具逻辑 ==========

    let TOOL_ID = null;
    const generateBtn = document.getElementById('generateBtn');
    const inputEl = document.getElementById('input');
    const outputEl = document.getElementById('output');
    const resultEl = document.getElementById('result');
    const remainingEl = document.getElementById('remaining');
    const btnTextEl = document.getElementById('btnText');
    const spinnerEl = document.getElementById('spinner');
    const copyBtn = document.getElementById('copyBtn');

    // 页面加载时检查使用次数
    async function initUsageCheck() {
      // Get tool ID (async for iframe support)
      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        remainingEl.innerText = 'N/A';
        remainingEl.parentElement.classList.add('bg-red-50', 'border-red-200');
        remainingEl.parentElement.querySelector('span').innerText = '工具ID未找到';
        generateBtn.disabled = true;
        return;
      }

      try {
        const fingerprint = generateFingerprint();
        const response = await fetch(\`/api/usage/check?toolId=\${TOOL_ID}&fingerprint=\${fingerprint}\`);
        const data = await response.json();

        if (data.allowed) {
          // 显示剩余次数
          const remaining = data.remaining === -1 ? '∞' : data.remaining;
          remainingEl.innerText = remaining;

          // 根据剩余次数改变颜色
          if (data.remaining <= 5 && data.remaining > 0) {
            remainingEl.parentElement.classList.remove('bg-blue-50', 'border-blue-200');
            remainingEl.parentElement.classList.add('bg-yellow-50', 'border-yellow-200');
            remainingEl.classList.remove('text-blue-600');
            remainingEl.classList.add('text-yellow-600');
          }
        } else {
          // 已达限制
          remainingEl.innerText = '0';
          remainingEl.parentElement.classList.remove('bg-blue-50', 'border-blue-200');
          remainingEl.parentElement.classList.add('bg-red-50', 'border-red-200');
          remainingEl.classList.remove('text-blue-600');
          remainingEl.classList.add('text-red-600');

          generateBtn.disabled = true;
          btnTextEl.innerText = '已达使用限制';

          // 显示提示信息
          const msg = document.createElement('p');
          msg.className = 'text-sm text-red-600 mt-2 text-center';
          msg.innerText = data.message || '请注册账号以获得更多使用次数';
          generateBtn.parentElement.appendChild(msg);
        }
      } catch (error) {
        console.error('Failed to check usage:', error);
        remainingEl.innerText = '--';
      }
    }

    // 初始化
    initUsageCheck();

    // ⭐ 立即生成按钮点击事件 - 核心集成点
    generateBtn.onclick = async () => {
      const text = inputEl.value.trim();

      // 验证输入
      if (!text) {
        alert('请输入要转换的文本');
        return;
      }

      // Ensure tool ID is loaded
      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        alert('工具ID未找到，无法记录使用');
        return;
      }

      // ⭐ 步骤1: 操作前检查使用限制
      if (!await checkUsage(TOOL_ID)) {
        alert('您已达到使用限制，请注册账号以获得更多使用次数');
        return;
      }

      // 显示加载状态
      generateBtn.disabled = true;
      btnTextEl.innerText = '处理中...';
      spinnerEl.classList.remove('hidden');
      outputEl.classList.add('hidden');

      try {
        // ⭐ 步骤2: 执行工具的核心功能
        // 这里是您的工具逻辑 - 示例：转换为大写
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟处理时间
        const result = text.toUpperCase();

        // 显示结果
        resultEl.innerText = result;
        outputEl.classList.remove('hidden');

        // ⭐ 步骤3: 操作成功后记录使用
        await recordUsage(TOOL_ID);

        // ⭐ 步骤4: 更新剩余次数显示
        await initUsageCheck();

      } catch (error) {
        alert('处理失败，请稍后重试');
        console.error(error);
      } finally {
        // 恢复按钮状态
        generateBtn.disabled = false;
        btnTextEl.innerText = '立即生成';
        spinnerEl.classList.add('hidden');
      }
    };

    // 复制结果功能
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(resultEl.innerText);
      const originalText = copyBtn.innerText;
      copyBtn.innerText = '已复制！';
      setTimeout(() => copyBtn.innerText = originalText, 2000);
    };
  </script>
</body>
</html>`

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-gray-600 mt-1">Usage Tracking & Limits Integration Guide</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl space-y-8">
          {/* Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
            </div>
            <p className="text-gray-700 mb-4">
              This API allows you to track tool usage and enforce usage limits for both logged-in users and guests.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Key Features:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Automatic usage tracking for logged-in users</li>
                <li>Browser fingerprint-based tracking for guests</li>
                <li>Configurable usage limits per user tier</li>
                <li>Monthly automatic reset for logged-in users</li>
                <li>Customizable reset period for guests</li>
              </ul>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">API Endpoints</h2>

            {/* Check Usage */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-mono rounded">GET</span>
                <code className="text-sm font-mono text-gray-900">/api/usage/check</code>
              </div>
              <p className="text-gray-700 mb-3">Check if a user can use a tool (without recording usage)</p>

              <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
              <div className="bg-gray-50 rounded p-3 mb-3">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="font-mono text-gray-900 py-1">toolId</td>
                      <td className="text-gray-600 py-1">Required. The ID of the tool</td>
                    </tr>
                    <tr>
                      <td className="font-mono text-gray-900 py-1">fingerprint</td>
                      <td className="text-gray-600 py-1">Required for guests. Browser fingerprint</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard('{"allowed": true, "remaining": 45, "limit": 50, "usageCount": 5}', 'check-response')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'check-response' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto">
{`{
  "allowed": true,
  "remaining": 45,
  "limit": 50,
  "usageCount": 5,
  "resetDate": "2025-12-01T00:00:00.000Z",
  "userType": "logged-in",
  "membershipTier": "FREE"
}`}
                </pre>
              </div>
            </div>

            {/* Record Usage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-mono rounded">POST</span>
                <code className="text-sm font-mono text-gray-900">/api/usage/record</code>
              </div>
              <p className="text-gray-700 mb-3">Record a tool usage and increment the counter</p>

              <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
              <div className="bg-gray-900 rounded-lg p-4 relative mb-3">
                <button
                  onClick={() => copyToClipboard('{"toolId": 1, "fingerprint": "abc123"}', 'record-request')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'record-request' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto">
{`{
  "toolId": 1,
  "fingerprint": "abc123"
}`}
                </pre>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard('{"success": true, "usageCount": 6, "remaining": 44}', 'record-response')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'record-response' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto">
{`{
  "success": true,
  "usageCount": 6,
  "remaining": 44,
  "userType": "logged-in"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Implementation Guide */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Implementation Guide</h2>
            </div>

            {/* Step 1 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 1: Get Tool ID from URL</h3>
              <p className="text-gray-600 mb-3 text-sm">
                工具ID会自动从页面URL中提取，无需手动配置。支持两种URL格式：
                <code className="bg-gray-100 px-2 py-1 rounded mx-1">/tools/[id]/xxx</code> 或查询参数
                <code className="bg-gray-100 px-2 py-1 rounded mx-1">?toolId=123</code>
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  ✅ iframe 支持已集成
                </h4>
                <p className="text-sm text-green-800 mb-2">
                  此函数已支持 <strong>iframe 环境</strong>。当工具在 iframe 中加载时（如本平台的工具详情页），会自动通过 <code className="bg-green-100 px-1 rounded">postMessage</code> 从父页面接收工具ID。
                </p>
                <ul className="list-disc list-inside text-green-800 text-sm space-y-1 ml-2">
                  <li><strong>iframe 环境</strong>：监听父页面发送的工具ID消息（3秒超时）</li>
                  <li><strong>直接访问</strong>：从URL路径或查询参数中提取工具ID</li>
                  <li><strong>异步处理</strong>：返回 Promise，确保在 iframe 中等待消息接收</li>
                </ul>
                <p className="text-xs text-green-700 mt-2">
                  💡 <strong>使用提示</strong>：由于是异步函数，请使用 <code className="bg-green-100 px-1 rounded">await getToolId()</code> 或 <code className="bg-green-100 px-1 rounded">.then()</code> 获取结果。
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard(getToolIdCode, 'getToolId')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'getToolId' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto">
                  {getToolIdCode}
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 2: Generate Browser Fingerprint</h3>
              <p className="text-gray-600 mb-3 text-sm">
                为访客用户生成唯一的浏览器指纹，用于追踪使用次数。浏览器指纹包含以下信息：
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">指纹组成部分：</h4>
                <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                  <li><code className="bg-blue-100 px-1 rounded">navigator.userAgent</code> - 浏览器类型、版本、操作系统</li>
                  <li><code className="bg-blue-100 px-1 rounded">navigator.language</code> - 浏览器语言设置（如 zh-CN）</li>
                  <li><code className="bg-blue-100 px-1 rounded">screen.width × height</code> - 屏幕分辨率（如 1920x1080）</li>
                  <li><code className="bg-blue-100 px-1 rounded">timezoneOffset</code> - 时区偏移量（如 UTC+8）</li>
                  <li><code className="bg-blue-100 px-1 rounded">canvas fingerprint</code> - Canvas渲染指纹（不同设备渲染结果略有差异）</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  这些信息通过哈希算法生成唯一标识符，不包含任何个人身份信息，仅用于统计使用次数。
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-amber-900 mb-2 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  双重验证机制
                </h4>
                <p className="text-sm text-amber-800 mb-2">
                  后端会同时使用<strong>浏览器指纹 + IP地址</strong>作为唯一标识，防止用户通过更换浏览器绕过限制：
                </p>
                <ul className="list-disc list-inside text-amber-800 text-sm space-y-1 ml-2">
                  <li>同一设备不同浏览器 → 指纹不同，但IP相同 → 仍会被识别</li>
                  <li>同一浏览器不同网络 → 指纹相同，但IP不同 → 仍会被识别</li>
                  <li>只有指纹和IP都不同时，才会被视为新用户</li>
                </ul>
                <p className="text-xs text-amber-700 mt-2">
                  IP地址由服务器自动获取（通过 <code className="bg-amber-100 px-1 rounded">x-forwarded-for</code> 或 <code className="bg-amber-100 px-1 rounded">x-real-ip</code> 请求头），前端无需处理。
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard(fingerprintCode, 'fingerprint')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'fingerprint' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto">
                  {fingerprintCode}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 3: Check Usage Before Action</h3>
              <p className="text-gray-600 mb-3 text-sm">
                在执行工具操作前，先检查用户是否还有剩余使用次数。
              </p>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard(checkUsageCode, 'check')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'check' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto">
                  {checkUsageCode}
                </pre>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 4: Record Usage After Action</h3>
              <p className="text-gray-600 mb-3 text-sm">
                在工具操作成功完成后，记录本次使用并更新计数器。
              </p>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard(recordUsageCode, 'record')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'record' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto">
                  {recordUsageCode}
                </pre>
              </div>
            </div>

            {/* Complete Example */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">完整示例 - 文本转大写工具（纯HTML版本）</h3>
              <p className="text-gray-600 mb-3 text-sm">
                这是一个完整的纯HTML工具示例，适用于各种前端环境。展示了如何集成使用限制追踪：
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm mb-3 space-y-1">
                <li>✅ 自动从URL获取工具ID（无需手动配置）</li>
                <li>✅ 页面加载时显示剩余使用次数（显眼位置）</li>
                <li>✅ 操作前检查使用限制（防止浪费资源）</li>
                <li>✅ 操作成功后记录使用（精确追踪）</li>
                <li>✅ 实时更新剩余次数显示（用户体验）</li>
                <li>✅ 智能颜色提示（蓝色→黄色→红色）</li>
              </ul>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-purple-900 mb-2 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  适用场景说明
                </h4>
                <div className="text-sm text-purple-800 space-y-2">
                  <p><strong>✅ 适用于：</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>纯HTML静态页面工具</li>
                    <li>使用CDN加载的单页面应用</li>
                    <li>嵌入iframe的工具页面</li>
                    <li>本地处理的前端工具（如文本转换、图片压缩等）</li>
                  </ul>
                  <p className="mt-2"><strong>⚠️ 注意事项：</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>如果工具需要调用后端API（如AI生成），请在API调用成功后再记录使用</li>
                    <li>如果工具是纯前端处理（如文本转换），可以在处理完成后立即记录</li>
                    <li>确保工具页面URL包含工具ID（如 /tools/123/xxx 或 ?toolId=123）</li>
                    <li>对于异步操作，务必在 try-catch 中处理，避免记录失败的操作</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard(completeExampleCode, 'complete')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'complete' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-gray-100 overflow-x-auto max-h-96">
                  {completeExampleCode}
                </pre>
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Default Usage Limits</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Limit</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Reset Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Guest (Unregistered)</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{config.guestUsageLimit} uses</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{config.guestResetDays} days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">FREE Member</td>
                    <td className="px-4 py-3 text-sm text-gray-600">50 uses</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Monthly (1st of each month)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">PREMIUM Member</td>
                    <td className="px-4 py-3 text-sm text-gray-600">500 uses</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Monthly (1st of each month)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">ENTERPRISE Member</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Unlimited</td>
                    <td className="px-4 py-3 text-sm text-gray-600">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              * Guest limits can be configured in the Global Settings panel
            </p>
          </div>

          {/* Content Filtering (Anti-Abuse) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Filtering (Anti-Abuse)</h2>
            <p className="text-gray-700 mb-4">
              For AI tools with specific themes (e.g., career planning, legal consultation), implement content filtering to prevent users from submitting irrelevant content and wasting AI resources.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Why Content Filtering?
              </h3>
              <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
                <li><strong>Prevent AI abuse:</strong> Users might try to use specialized tools for unrelated topics</li>
                <li><strong>Save costs:</strong> Each AI call consumes API credits and usage limits</li>
                <li><strong>Improve quality:</strong> Ensure the tool is used for its intended purpose</li>
                <li><strong>Better UX:</strong> Guide users to use the right tool for their needs</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Approaches</h3>

            <div className="space-y-4">
              {/* Approach 1: Client-side filtering */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">Recommended</span>
                  1. Client-side Keyword Filtering (Fast, No API Cost)
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Use whitelist and blacklist keywords to filter content before making API calls. This is the most efficient approach.
                </p>
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-semibold text-gray-900 mb-2">Implementation:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                    <li>Define relevant keywords (whitelist) for your tool's theme</li>
                    <li>Define irrelevant topics (blacklist) to reject immediately</li>
                    <li>Check input length (minimum 10 characters recommended)</li>
                    <li>Validate before calling <code className="bg-gray-200 px-1 rounded">/api/usage/check</code></li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    ✅ <strong>Pros:</strong> Fast, no API cost, immediate feedback<br/>
                    ⚠️ <strong>Cons:</strong> May have false positives/negatives
                  </p>
                </div>
              </div>

              {/* Approach 2: AI-powered filtering */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">Advanced</span>
                  2. AI-powered Relevance Check (Accurate, Costs 1 Usage)
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Use AI to determine if the user's input is relevant to the tool's theme. More accurate but consumes an additional API call.
                </p>
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-semibold text-gray-900 mb-2">Implementation:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                    <li>Call <code className="bg-gray-200 px-1 rounded">/api/ai/chat</code> with a relevance check prompt</li>
                    <li>Ask AI to return JSON: <code className="bg-gray-200 px-1 rounded">{`{"relevant": true/false, "reason": "..."}`}</code></li>
                    <li>Set low temperature (0.3) for consistent results</li>
                    <li>Use low maxTokens (100) to minimize cost</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    ✅ <strong>Pros:</strong> Very accurate, understands context<br/>
                    ⚠️ <strong>Cons:</strong> Costs 1 usage, slower response
                  </p>
                </div>
              </div>

              {/* Hybrid approach */}
              <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Best Practice: Hybrid Approach
                </h4>
                <p className="text-purple-800 text-sm mb-2">
                  Combine both approaches for optimal results:
                </p>
                <ol className="list-decimal list-inside text-purple-800 text-sm space-y-1 ml-2">
                  <li><strong>First:</strong> Use client-side keyword filtering (fast rejection)</li>
                  <li><strong>Then:</strong> If uncertain, optionally use AI check for edge cases</li>
                  <li><strong>Finally:</strong> Proceed with main AI call if content is relevant</li>
                </ol>
                <p className="text-xs text-purple-700 mt-2">
                  This approach minimizes false rejections while keeping costs low.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">Usage Counting Note:</h4>
              <p className="text-sm text-blue-800 mb-2">
                Content filtering happens <strong>before</strong> usage tracking:
              </p>
              <ol className="list-decimal list-inside text-blue-800 text-sm space-y-1 ml-4">
                <li>User submits input</li>
                <li><strong>Filter content</strong> (client-side or AI-powered)</li>
                <li>If rejected → Show error, <strong>no usage recorded</strong></li>
                <li>If approved → Call <code className="bg-blue-100 px-1 rounded">/api/usage/check</code></li>
                <li>If allowed → Execute main tool function</li>
                <li>If successful → Call <code className="bg-blue-100 px-1 rounded">/api/usage/record</code></li>
              </ol>
              <p className="text-xs text-blue-700 mt-2">
                ⚠️ <strong>Important:</strong> If using AI-powered filtering, it will consume 1 usage even if the content is rejected. Consider this when designing your filtering strategy.
              </p>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Filter content first</p>
                  <p className="text-gray-600 text-sm">For AI tools with specific themes, validate content relevance before checking usage limits to prevent wasting API calls.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Check before action</p>
                  <p className="text-gray-600 text-sm">Always call <code className="bg-gray-100 px-1 rounded">/api/usage/check</code> before performing the tool action to prevent wasted operations.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Record after success</p>
                  <p className="text-gray-600 text-sm">Only call <code className="bg-gray-100 px-1 rounded">/api/usage/record</code> after the tool action completes successfully.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Show remaining uses</p>
                  <p className="text-gray-600 text-sm">Display remaining uses to users when they're running low (e.g., less than 5 remaining).</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  5
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Handle errors gracefully</p>
                  <p className="text-gray-600 text-sm">Always handle API errors and show user-friendly messages when limits are reached.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
