'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Copy, Check, Code, BookOpen, Zap, AlertCircle, Share2 } from 'lucide-react'

interface SiteConfig {
  guestUsageLimit: number
  guestResetDays: number
}

export default function IntegrationGuidePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expandedExample, setExpandedExample] = useState<number | null>(null)
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

  // ============================================================================
  // 核心代码片段
  // ============================================================================

  const fingerprintCode = `<!-- 引入统一指纹库 -->
<script src="/js/fingerprint.js"></script>

<script>
  // 生成设备指纹的辅助函数（带容错机制）
  function generateFingerprint() {
    try {
      // 检查指纹库是否加载成功
      if (typeof FP !== 'undefined' && FP.getDeviceId) {
        // 使用设备ID（跨浏览器识别同一设备，推荐）
        // 基于硬件特征：GPU、CPU核数、屏幕分辨率等
        // 同一设备不同浏览器生成相同ID
        return FP.getDeviceId();
      }
      throw new Error('Fingerprint library not loaded');
    } catch (e) {
      console.warn('Fingerprint generation failed, using fallback:', e);
      // 降级方案：使用localStorage持久化fallback ID
      // 这样即使刷新页面或切换浏览器，同一浏览器的ID保持一致
      try {
        const storageKey = '_fp_fallback_id';
        let fallbackId = localStorage.getItem(storageKey);
        if (!fallbackId) {
          fallbackId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem(storageKey, fallbackId);
        }
        return fallbackId;
      } catch (storageError) {
        // 如果localStorage也不可用（隐私模式），使用临时ID
        console.warn('localStorage not available:', storageError);
        return 'fallback-temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }
    }
  }

  // 使用示例
  const fingerprint = generateFingerprint();
  console.log('Device Fingerprint:', fingerprint);
</script>`

  const getToolIdCode = `// 自动获取工具ID（支持iframe和直接访问）
function getToolId() {
  return new Promise((resolve) => {
    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      let toolIdReceived = false;

      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'TOOL_ID') {
          toolIdReceived = true;
          resolve(event.data.toolId);
        }
      });

      setTimeout(() => {
        if (!toolIdReceived) {
          console.warn('Tool ID not received from parent, trying URL parsing...');
          resolve(getToolIdFromUrl());
        }
      }, 3000);
    } else {
      resolve(getToolIdFromUrl());
    }
  });
}

function getToolIdFromUrl() {
  const pathParts = window.location.pathname.split('/');
  const toolsIndex = pathParts.indexOf('tools');

  if (toolsIndex !== -1 && pathParts[toolsIndex + 1]) {
    const slugOrId = pathParts[toolsIndex + 1];
    const id = parseInt(slugOrId);
    if (!isNaN(id)) return id;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const toolId = urlParams.get('toolId');
  if (toolId) return parseInt(toolId);

  console.error('Unable to detect tool ID from URL');
  return null;
}`

  const checkUsageCode = `// 检查用户是否还有剩余次数
async function checkUsage(toolId) {
  const fingerprint = generateFingerprint();

  const response = await fetch(\`/api/usage/check?toolId=\${toolId}&fingerprint=\${fingerprint}\`);
  const data = await response.json();

  if (!data.allowed) {
    alert(data.message || 'Usage limit reached. Please register for more uses.');
    return false;
  }

  if (data.remaining > 0 && data.remaining <= 5) {
    console.log(\`You have \${data.remaining} uses remaining\`);
  }

  return true;
}`

  const recordUsageCode = `// 记录工具使用
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

  // ============================================================================
  // 内容过滤代码片段
  // ============================================================================

  const contentFilterCode = `// 内容相关性检查（防止滥用）
// 适用于特定主题的工具，如职业规划、法律咨询等
function checkContentRelevance(userInput, toolTheme) {
  // 1. 定义工具相关的关键词（白名单）
  const relevantKeywords = {
    '职业规划': ['职业', '工作', '就业', '求职', '面试', '简历', '跳槽', '晋升', '转行', '发展', '规划', '岗位', '行业', '技能', '薪资', '职场'],
    '法律咨询': ['法律', '合同', '诉讼', '律师', '法院', '权益', '赔偿', '违约', '纠纷', '起诉', '法规', '条款'],
    '健康咨询': ['健康', '疾病', '症状', '治疗', '医生', '药物', '体检', '营养', '锻炼', '保健', '医疗'],
    '教育辅导': ['学习', '考试', '作业', '课程', '教育', '辅导', '知识', '题目', '成绩', '学校', '老师']
  };

  // 2. 定义明确的无关话题（黑名单）
  const irrelevantTopics = {
    '职业规划': ['游戏', '娱乐', '八卦', '明星', '电影', '小说', '菜谱', '旅游', '购物', '化妆'],
    '法律咨询': ['游戏', '娱乐', '菜谱', '旅游', '化妆', '明星'],
    '健康咨询': ['游戏', '娱乐', '八卦', '明星', '电影'],
    '教育辅导': ['游戏', '娱乐', '八卦', '明星', '购物']
  };

  const input = userInput.toLowerCase();
  const keywords = relevantKeywords[toolTheme] || [];
  const blacklist = irrelevantTopics[toolTheme] || [];

  // 3. 检查是否包含黑名单关键词（直接拒绝）
  for (const word of blacklist) {
    if (input.includes(word)) {
      return {
        allowed: false,
        reason: \`本工具专注于\${toolTheme}相关问题，不支持\${word}相关咨询\`
      };
    }
  }

  // 4. 检查输入长度（太短直接拒绝）
  if (input.length < 10) {
    return {
      allowed: false,
      reason: '请提供更详细的问题描述（至少10个字），以便为您提供更准确的建议。'
    };
  }

  // 5. 检查是否包含相关关键词（至少匹配一个）
  const hasRelevantKeyword = keywords.some(keyword => input.includes(keyword));

  // 6. 如果没有匹配到相关关键词，直接拒绝
  if (!hasRelevantKeyword) {
    return {
      allowed: false,
      reason: \`本工具专注于\${toolTheme}，您的问题似乎与此主题无关。\\n\\n请确保您的问题与\${toolTheme}相关，或重新输入。\`
    };
  }

  // 7. 通过所有检查
  return { allowed: true };
}

// 使用示例
const result = checkContentRelevance(userInput, '职业规划');
if (!result.allowed) {
  alert(result.reason);
  return; // 直接拒绝，不允许继续
}`

  const advancedFilterCode = `// 高级内容过滤（使用AI进行相关性判断）
// 适用于需要更精确判断的场景
async function checkContentRelevanceWithAI(userInput, toolTheme) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: \`你是一个内容审核助手。判断用户输入是否与"\${toolTheme}"主题相关。只回复JSON格式：{"relevant": true/false, "reason": "原因"}\`
          },
          {
            role: 'user',
            content: \`用户输入：\${userInput}\\n\\n这个输入是否与"\${toolTheme}"相关？\`
          }
        ],
        temperature: 0.3,
        maxTokens: 100
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.content);

    return {
      allowed: result.relevant,
      reason: result.reason
    };
  } catch (error) {
    console.error('AI relevance check failed:', error);
    // 如果AI检查失败，默认允许通过（避免误拦截）
    return { allowed: true };
  }
}

// 使用示例（注意：这会消耗一次AI调用）
const result = await checkContentRelevanceWithAI(userInput, '职业规划');
if (!result.allowed) {
  alert('您的问题与职业规划主题不相关：' + result.reason);
  return;
}`

  // ============================================================================
  // 四种完整场景示例
  // ============================================================================

  const examples = [
    {
      title: '场景1：普通HTML工具（无AI，有次数限制）',
      description: '适用于纯前端处理的工具，如文本转换、格式化等',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>文本转大写工具</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">文本转大写工具</h1>
      <p class="text-gray-600">将您的文本转换为大写字母</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 剩余次数显示 -->
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <span class="text-sm font-medium text-blue-900">剩余使用次数</span>
        <span id="remaining" class="text-lg font-bold text-blue-600">--</span>
      </div>

      <!-- 输入区域 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
        <textarea
          id="input"
          rows="6"
          placeholder="请输入要转换的文本..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- 转换按钮 -->
      <button
        id="convertBtn"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
        立即转换
      </button>

      <!-- 输出区域 -->
      <div id="output" class="hidden mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">转换结果</label>
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p id="result" class="text-gray-900 whitespace-pre-wrap"></p>
        </div>
      </div>
    </div>
  </div>

  <script src="/js/fingerprint.js"></script>
  <script>
    ${getToolIdCode}

    // 生成设备指纹的辅助函数（带容错机制）
    function generateFingerprint() {
      try {
        if (typeof FP !== 'undefined' && FP.getDeviceId) {
          return FP.getDeviceId();
        }
        throw new Error('Fingerprint library not loaded');
      } catch (e) {
        console.warn('Fingerprint generation failed, using fallback:', e);
        try {
          const storageKey = '_fp_fallback_id';
          let fallbackId = localStorage.getItem(storageKey);
          if (!fallbackId) {
            fallbackId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(storageKey, fallbackId);
          }
          return fallbackId;
        } catch (storageError) {
          console.warn('localStorage not available:', storageError);
          return 'fallback-temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
      }
    }

    ${checkUsageCode}

    ${recordUsageCode}

    let TOOL_ID = null;
    const convertBtn = document.getElementById('convertBtn');
    const inputEl = document.getElementById('input');
    const outputEl = document.getElementById('output');
    const resultEl = document.getElementById('result');
    const remainingEl = document.getElementById('remaining');

    // 页面加载时检查使用次数
    async function initUsageCheck() {
      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        remainingEl.innerText = 'N/A';
        convertBtn.disabled = true;
        return;
      }

      try {
        const fingerprint = generateFingerprint();
        const response = await fetch(\`/api/usage/check?toolId=\${TOOL_ID}&fingerprint=\${fingerprint}\`);
        const data = await response.json();

        if (data.allowed) {
          const remaining = data.remaining === -1 ? '∞' : data.remaining;
          remainingEl.innerText = remaining;
        } else {
          remainingEl.innerText = '0';
          convertBtn.disabled = true;
          convertBtn.innerText = '已达使用限制';
        }
      } catch (error) {
        console.error('Failed to check usage:', error);
        remainingEl.innerText = '--';
      }
    }

    initUsageCheck();

    // 转换按钮点击事件
    convertBtn.onclick = async () => {
      const text = inputEl.value.trim();

      if (!text) {
        alert('请输入要转换的文本');
        return;
      }

      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        alert('工具ID未找到');
        return;
      }

      // 步骤1: 检查使用限制
      if (!await checkUsage(TOOL_ID)) {
        return;
      }

      // 步骤2: 执行工具功能
      const result = text.toUpperCase();
      resultEl.innerText = result;
      outputEl.classList.remove('hidden');

      // 步骤3: 记录使用
      await recordUsage(TOOL_ID);

      // 步骤4: 更新剩余次数
      await initUsageCheck();
    };
  </script>
</body>
</html>`
    },
    {
      title: '场景2：AI工具（有次数限制）',
      description: '调用AI接口生成内容，如文案生成、智能翻译等',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>AI文案生成工具</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
</head>
<body class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">AI文案生成工具</h1>
      <p class="text-gray-600">使用AI帮您生成专业文案</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 剩余次数显示 -->
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <span class="text-sm font-medium text-blue-900">剩余使用次数</span>
        <span id="remaining" class="text-lg font-bold text-blue-600">--</span>
      </div>

      <!-- 输入区域 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">文案主题</label>
        <input
          id="topic"
          type="text"
          placeholder="例如：介绍一款智能手表的产品文案"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- 生成按钮 -->
      <button
        id="generateBtn"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
      >
        <span id="btnText">AI生成文案</span>
        <div id="spinner" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </button>

      <!-- 输出区域 -->
      <div id="output" class="hidden mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">生成结果</label>
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none">
          <div id="result"></div>
        </div>
      </div>
    </div>
  </div>

  <script src="/js/fingerprint.js"></script>
  <script>
    ${getToolIdCode}

    // 生成设备指纹的辅助函数（带容错机制）
    function generateFingerprint() {
      try {
        if (typeof FP !== 'undefined' && FP.getDeviceId) {
          return FP.getDeviceId();
        }
        throw new Error('Fingerprint library not loaded');
      } catch (e) {
        console.warn('Fingerprint generation failed, using fallback:', e);
        try {
          const storageKey = '_fp_fallback_id';
          let fallbackId = localStorage.getItem(storageKey);
          if (!fallbackId) {
            fallbackId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(storageKey, fallbackId);
          }
          return fallbackId;
        } catch (storageError) {
          console.warn('localStorage not available:', storageError);
          return 'fallback-temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
      }
    }

    ${checkUsageCode}

    ${recordUsageCode}

    let TOOL_ID = null;
    const generateBtn = document.getElementById('generateBtn');
    const topicEl = document.getElementById('topic');
    const outputEl = document.getElementById('output');
    const resultEl = document.getElementById('result');
    const remainingEl = document.getElementById('remaining');
    const btnTextEl = document.getElementById('btnText');
    const spinnerEl = document.getElementById('spinner');

    // 页面加载时检查使用次数
    async function initUsageCheck() {
      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        remainingEl.innerText = 'N/A';
        generateBtn.disabled = true;
        return;
      }

      try {
        const fingerprint = generateFingerprint();
        const response = await fetch(\`/api/usage/check?toolId=\${TOOL_ID}&fingerprint=\${fingerprint}\`);
        const data = await response.json();

        if (data.allowed) {
          const remaining = data.remaining === -1 ? '∞' : data.remaining;
          remainingEl.innerText = remaining;
        } else {
          remainingEl.innerText = '0';
          generateBtn.disabled = true;
          btnTextEl.innerText = '已达使用限制';
        }
      } catch (error) {
        console.error('Failed to check usage:', error);
        remainingEl.innerText = '--';
      }
    }

    initUsageCheck();

    // 生成按钮点击事件
    generateBtn.onclick = async () => {
      const topic = topicEl.value.trim();

      if (!topic) {
        alert('请输入文案主题');
        return;
      }

      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        alert('工具ID未找到');
        return;
      }

      // 步骤1: 检查使用限制
      if (!await checkUsage(TOOL_ID)) {
        return;
      }

      // 显示加载状态
      generateBtn.disabled = true;
      btnTextEl.innerText = 'AI生成中...';
      spinnerEl.classList.remove('hidden');
      outputEl.classList.add('hidden');

      try {
        // 步骤2: 调用AI接口
        const fingerprint = generateFingerprint();
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: '你是一个专业的文案撰写助手。请根据用户提供的主题，生成吸引人的营销文案。文案要简洁有力，突出产品特点和优势。'
              },
              {
                role: 'user',
                content: \`请为以下主题生成文案：\${topic}\`
              }
            ],
            temperature: 0.7,
            maxTokens: 1000,
            fingerprint: fingerprint
          })
        });

        if (!response.ok) {
          throw new Error('AI调用失败');
        }

        const data = await response.json();
        // 使用marked渲染Markdown
        resultEl.innerHTML = marked.parse(data.content);
        outputEl.classList.remove('hidden');

        // 步骤3: 记录使用
        await recordUsage(TOOL_ID);

        // 步骤4: 更新剩余次数
        await initUsageCheck();

      } catch (error) {
        alert('生成失败：' + error.message);
        console.error(error);
      } finally {
        generateBtn.disabled = false;
        btnTextEl.innerText = 'AI生成文案';
        spinnerEl.classList.add('hidden');
      }
    };
  </script>
</body>
</html>`
    },
    {
      title: '场景3：混合工具（普通功能 + AI功能）',
      description: '同时提供普通处理和AI增强功能，如文本编辑器 + AI优化',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>智能文本编辑器</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
</head>
<body class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">智能文本编辑器</h1>
      <p class="text-gray-600">提供基础编辑和AI智能优化功能</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 剩余次数显示 -->
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <span class="text-sm font-medium text-blue-900">AI优化剩余次数</span>
        <span id="remaining" class="text-lg font-bold text-blue-600">--</span>
      </div>

      <!-- 输入区域 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">文本内容</label>
        <textarea
          id="input"
          rows="8"
          placeholder="输入或粘贴您的文本..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- 功能按钮组 -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- 普通功能（不消耗次数） -->
        <button
          id="upperBtn"
          class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg">
          转大写（免费）
        </button>
        <button
          id="lowerBtn"
          class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg"
        >
          转小写（免费）
        </button>
        <!-- AI功能（消耗次数） -->
        <button
          id="optimizeBtn"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg col-span-2 flex items-center justify-center gap-2"
        >
          <span id="optimizeBtnText">AI智能优化（消耗1次）</span>
          <div id="optimizeSpinner" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>
      </div>

      <!-- 输出区域 -->
      <div id="output" class="hidden mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">处理结果</label>
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div id="result" class="prose max-w-none"></div>
        </div>
      </div>
    </div>
  </div>

  <script src="/js/fingerprint.js"></script>
  <script>
    ${getToolIdCode}

    // 生成设备指纹的辅助函数（带容错机制）
    function generateFingerprint() {
      try {
        if (typeof FP !== 'undefined' && FP.getDeviceId) {
          return FP.getDeviceId();
        }
        throw new Error('Fingerprint library not loaded');
      } catch (e) {
        console.warn('Fingerprint generation failed, using fallback:', e);
        try {
          const storageKey = '_fp_fallback_id';
          let fallbackId = localStorage.getItem(storageKey);
          if (!fallbackId) {
            fallbackId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(storageKey, fallbackId);
          }
          return fallbackId;
        } catch (storageError) {
          console.warn('localStorage not available:', storageError);
          return 'fallback-temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
      }
    }

    ${checkUsageCode}

    ${recordUsageCode}

    let TOOL_ID = null;
    const inputEl = document.getElementById('input');
    const outputEl = document.getElementById('output');
    const resultEl = document.getElementById('result');
    const remainingEl = document.getElementById('remaining');

    const upperBtn = document.getElementById('upperBtn');
    const lowerBtn = document.getElementById('lowerBtn');
    const optimizeBtn = document.getElementById('optimizeBtn');
    const optimizeBtnText = document.getElementById('optimizeBtnText');
    const optimizeSpinner = document.getElementById('optimizeSpinner');

    // 页面加载时检查使用次数
    async function initUsageCheck() {
      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        remainingEl.innerText = 'N/A';
        optimizeBtn.disabled = true;
        return;
      }

      try {
        const fingerprint = generateFingerprint();
        const response = await fetch(\`/api/usage/check?toolId=\${TOOL_ID}&fingerprint=\${fingerprint}\`);
        const data = await response.json();

        if (data.allowed) {
          const remaining = data.remaining === -1 ? '∞' : data.remaining;
          remainingEl.innerText = remaining;
        } else {
          remainingEl.innerText = '0';
          optimizeBtn.disabled = true;
          optimizeBtnText.innerText = 'AI优化已达限制';
        }
      } catch (error) {
        console.error('Failed to check usage:', error);
        remainingEl.innerText = '--';
      }
    }

    initUsageCheck();

    // 普通功能1：转大写（不消耗次数）
    upperBtn.onclick = () => {
      const text = inputEl.value.trim();
      if (!text) {
        alert('请输入文本');
        return;
      }
      
      resultEl.innerText = text.toUpperCase();
      outputEl.classList.remove('hidden');
    };

    // 普通功能2：转小写（不消耗次数）
    lowerBtn.onclick = () => {
      const text = inputEl.value.trim();
      if (!text) {
        alert('请输入文本');
        return;
      }
      
      resultEl.innerText = text.toLowerCase();
      outputEl.classList.remove('hidden');
    };

    // AI功能：智能优化（消耗次数）
    optimizeBtn.onclick = async () => {
      const text = inputEl.value.trim();

      if (!text) {
        alert('请输入文本');
        return;
      }

      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        alert('工具ID未找到');
        return;
      }

      // 步骤1: 检查使用限制
      if (!await checkUsage(TOOL_ID)) {
        return;
      }

      // 显示加载状态
      optimizeBtn.disabled = true;
      optimizeBtnText.innerText = 'AI优化中...';
      optimizeSpinner.classList.remove('hidden');
      outputEl.classList.add('hidden');

      try {
        // 步骤2: 调用AI接口
        const fingerprint = generateFingerprint();
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: '你是一个专业的文本优化助手。请优化用户提供的文本，使其更加流畅、专业、易读。保持原意，但改进表达方式、语法和结构。'
              },
              {
                role: 'user',
                content: \`请优化以下文本：\\n\\n\${text}\`
              }
            ],
            temperature: 0.7,
            maxTokens: 2000,
            fingerprint: fingerprint
          })
        });

        if (!response.ok) {
          throw new Error('AI调用失败');
        }

        const data = await response.json();
        
        // 使用marked渲染Markdown
        resultEl.innerHTML = marked.parse(data.content);
        outputEl.classList.remove('hidden');

        // 步骤3: 记录使用
        await recordUsage(TOOL_ID);

        // 步骤4: 更新剩余次数
        await initUsageCheck();

      } catch (error) {
        alert('优化失败：' + error.message);
        console.error(error);
      } finally {
        optimizeBtn.disabled = false;
        optimizeBtnText.innerText = 'AI智能优化（消耗1次）';
        optimizeSpinner.classList.add('hidden');
      }
    };
  </script>
</body>
</html>`
    },
    {
      title: '场景4：AI工具（管理员专用，无次数限制）',
      description: '适用于管理后台内部工具，管理员登录后无需检查使用限制',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>AI内容生成器（管理员专用）</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
</head>
<body class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">AI内容生成器（管理员版）</h1>
      <p class="text-gray-600">管理员专用，无使用限制</p>
      <div class="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
        ✓ 管理员无限制使用
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 输入区域 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">输入提示词</label>
        <textarea
          id="prompt"
          rows="4"
          placeholder="请输入您的提示词..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- 高级选项 -->
      <div class="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
          <input
            id="temperature"
            type="number"
            min="0"
            max="1"
            step="0.1"
            value="0.7"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
          <input
            id="maxTokens"
            type="number"
            min="100"
            max="4000"
            step="100"
            value="2000"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- 生成按钮 -->
      <button
        id="generateBtn"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
      >
        <span id="btnText">AI生成内容</span>
        <div id="spinner" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </button>

      <!-- 输出区域 -->
      <div id="output" class="hidden mt-6">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">生成结果</label>
          <button
            id="copyBtn"
            class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            复制结果
          </button>
        </div>
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none">
          <div id="result"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const generateBtn = document.getElementById('generateBtn');
    const promptEl = document.getElementById('prompt');
    const temperatureEl = document.getElementById('temperature');
    const maxTokensEl = document.getElementById('maxTokens');
    const outputEl = document.getElementById('output');
    const resultEl = document.getElementById('result');
    const btnTextEl = document.getElementById('btnText');
    const spinnerEl = document.getElementById('spinner');
    const copyBtn = document.getElementById('copyBtn');

    // 生成按钮点击事件
    generateBtn.onclick = async () => {
      const prompt = promptEl.value.trim();
      const temperature = parseFloat(temperatureEl.value);
      const maxTokens = parseInt(maxTokensEl.value);

      if (!prompt) {
        alert('请输入提示词');
        return;
      }

      // 显示加载状态
      generateBtn.disabled = true;
      btnTextEl.innerText = 'AI生成中...';
      spinnerEl.classList.remove('hidden');
      outputEl.classList.add('hidden');

      try {
        // 直接调用AI接口，无需检查使用限制
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: '你是一个专业的AI助手。请根据用户的提示词生成高质量的内容。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: temperature,
            maxTokens: maxTokens
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'AI调用失败');
        }

        const data = await response.json();

        // 使用marked渲染Markdown，并用DOMPurify清洗防止XSS攻击
        const rawHtml = marked.parse(data.content);
        resultEl.innerHTML = DOMPurify.sanitize(rawHtml);
        outputEl.classList.remove('hidden');

        // 注意：管理员调用AI接口时，系统会自动识别管理员身份（通过session），无需记录使用次数

      } catch (error) {
        alert('生成失败：' + error.message);
        console.error(error);
      } finally {
        generateBtn.disabled = false;
        btnTextEl.innerText = 'AI生成内容';
        spinnerEl.classList.add('hidden');
      }
    };

    // 复制结果按钮
    copyBtn.onclick = () => {
      const text = resultEl.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 已复制';
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      });
    };

    // 支持Enter键提交（Ctrl+Enter）
    promptEl.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        generateBtn.click();
      }
    });
  </script>
</body>
</html>`
    },
    {
      title: '场景5：带主题过滤的AI工具（防滥用）',
      description: '适用于特定主题的工具，如职业规划、法律咨询等，防止用户发送无关内容',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>AI职业规划助手</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
</head>
<body class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">AI职业规划助手</h1>
      <p class="text-gray-600">专注于职业发展和规划建议</p>
      <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        ⚠️ 本工具仅回答职业规划相关问题，其他话题将被拒绝
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 剩余次数显示 -->
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <span class="text-sm font-medium text-blue-900">剩余咨询次数</span>
        <span id="remaining" class="text-lg font-bold text-blue-600">--</span>
      </div>

      <!-- 输入区域 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">您的职业问题</label>
        <textarea
          id="question"
          rows="6"
          placeholder="例如：我是一名3年经验的前端开发，想转行做产品经理，应该如何准备？"
          spellcheck="false"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">
          提示：请描述您的职业背景、遇到的问题或规划目标
        </p>
      </div>

      <!-- 错误提示区域 -->
      <div id="error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p id="errorMsg" class="text-sm text-red-800"></p>
      </div>

      <!-- 生成按钮 -->
      <button
        id="consultBtn"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
      >
        <span id="btnText">获取职业建议</span>
        <div id="spinner" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </button>

      <!-- 输出区域 -->
      <div id="output" class="hidden mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">职业建议</label>
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none">
          <div id="result"></div>
        </div>
      </div>
    </div>
  </div>

  <script src="/js/fingerprint.js"></script>
  <script>
    ${getToolIdCode}

    // 生成设备指纹的辅助函数（带容错机制）
    function generateFingerprint() {
      try {
        if (typeof FP !== 'undefined' && FP.getDeviceId) {
          return FP.getDeviceId();
        }
        throw new Error('Fingerprint library not loaded');
      } catch (e) {
        console.warn('Fingerprint generation failed, using fallback:', e);
        try {
          const storageKey = '_fp_fallback_id';
          let fallbackId = localStorage.getItem(storageKey);
          if (!fallbackId) {
            fallbackId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(storageKey, fallbackId);
          }
          return fallbackId;
        } catch (storageError) {
          console.warn('localStorage not available:', storageError);
          return 'fallback-temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
      }
    }

    ${checkUsageCode}

    ${recordUsageCode}

    // ========== 内容过滤函数 ==========
    function checkContentRelevance(userInput) {
      // 1. 定义职业规划相关的关键词（白名单）
      const relevantKeywords = [
        '职业', '工作', '就业', '求职', '面试', '简历', '跳槽', '晋升',
        '转行', '发展', '规划', '岗位', '行业', '技能', '薪资', '职场',
        '公司', '领导', '同事', '团队', '项目', '经验', '能力', '学历',
        '培训', '证书', '创业', '兼职', '实习', '应届', '毕业', '择业'
      ];

      // 2. 定义明确无关的话题（黑名单）
      const irrelevantTopics = [
        '游戏', '娱乐', '八卦', '明星', '电影', '电视剧', '小说', '动漫',
        '菜谱', '做菜', '美食', '旅游', '景点', '购物', '化妆', '护肤',
        '减肥', '健身', '约会', '恋爱', '相亲', '婚姻', '家庭', '育儿',
        '股票', '基金', '彩票', '赌博', '借钱', '贷款'
      ];

      const input = userInput.toLowerCase();

      // 3. 首先检查黑名单（明确拒绝）
      for (const word of irrelevantTopics) {
        if (input.includes(word)) {
          return {
            allowed: false,
            reason: \`本工具专注于职业规划咨询，不支持\${word}相关话题。\\n\\n如需职业规划建议，请重新输入相关问题。\`
          };
        }
      }

      // 4. 检查输入长度
      if (input.length < 10) {
        return {
          allowed: false,
          reason: '请提供更详细的问题描述（至少10个字），以便为您提供更准确的职业建议。'
        };
      }

      // 5. 检查是否包含相关关键词
      const hasRelevantKeyword = relevantKeywords.some(keyword => input.includes(keyword));

      if (!hasRelevantKeyword) {
        // 没有匹配到关键词，直接拒绝（不允许确认）
        return {
          allowed: false,
          reason: '您的问题似乎与职业规划无关。\\n\\n本工具专注于：\\n• 职业发展规划\\n• 求职面试指导\\n• 转行跳槽建议\\n• 职场技能提升\\n\\n请重新输入职业相关问题。'
        };
      }

      // 6. 通过检查
      return { allowed: true };
    }

    // ========== 页面初始化 ==========
    let TOOL_ID = null;
    const consultBtn = document.getElementById('consultBtn');
    const questionEl = document.getElementById('question');
    const outputEl = document.getElementById('output');
    const resultEl = document.getElementById('result');
    const remainingEl = document.getElementById('remaining');
    const btnTextEl = document.getElementById('btnText');
    const spinnerEl = document.getElementById('spinner');
    const errorEl = document.getElementById('error');
    const errorMsgEl = document.getElementById('errorMsg');

    // 显示错误提示
    function showError(msg) {
      errorMsgEl.innerText = msg;
      errorEl.classList.remove('hidden');
      outputEl.classList.add('hidden');
      setTimeout(() => errorEl.classList.add('hidden'), 5000); // 5秒后自动隐藏
    }

    // 页面加载时检查使用次数
    async function initUsageCheck() {
      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        remainingEl.innerText = 'N/A';
        consultBtn.disabled = true;
        return;
      }

      try {
        const fingerprint = generateFingerprint();
        const response = await fetch(\`/api/usage/check?toolId=\${TOOL_ID}&fingerprint=\${fingerprint}\`);
        const data = await response.json();

        if (data.allowed) {
          const remaining = data.remaining === -1 ? '∞' : data.remaining;
          remainingEl.innerText = remaining;
        } else {
          remainingEl.innerText = '0';
          consultBtn.disabled = true;
          btnTextEl.innerText = '已达使用限制';
        }
      } catch (error) {
        console.error('Failed to check usage:', error);
        remainingEl.innerText = '--';
      }
    }

    initUsageCheck();

    // 咨询按钮点击事件
    consultBtn.onclick = async () => {
      const question = questionEl.value.trim();

      if (!question) {
        showError('请输入您的职业问题');
        return;
      }

      // ========== 步骤1: 内容过滤检查 ==========
      const filterResult = checkContentRelevance(question);
      if (!filterResult.allowed) {
        showError(filterResult.reason);
        return; // 直接拒绝，不允许继续提交
      }

      if (!TOOL_ID) {
        TOOL_ID = await getToolId();
      }

      if (!TOOL_ID) {
        showError('工具ID未找到，请刷新页面重试');
        return;
      }

      // ========== 步骤2: 检查使用限制 ==========
      if (!await checkUsage(TOOL_ID)) {
        return;
      }

      // 隐藏错误提示
      errorEl.classList.add('hidden');

      // 显示加载状态
      consultBtn.disabled = true;
      btnTextEl.innerText = 'AI分析中...';
      spinnerEl.classList.remove('hidden');
      outputEl.classList.add('hidden');

      try {
        // ========== 步骤3: 调用AI接口 ==========
        const fingerprint = generateFingerprint();
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: '你是一个专业的职业规划顾问。请根据用户的问题，提供专业、实用的职业发展建议。建议要具体、可操作，并考虑当前就业市场情况。'
              },
              {
                role: 'user',
                content: question
              }
            ],
            temperature: 0.7,
            maxTokens: 2000,
            fingerprint: fingerprint
          })
        });

        if (!response.ok) {
          throw new Error('AI调用失败');
        }

        const data = await response.json();

        // 使用marked渲染Markdown，并用DOMPurify清洗防止XSS攻击
        const rawHtml = marked.parse(data.content);
        resultEl.innerHTML = DOMPurify.sanitize(rawHtml);
        outputEl.classList.remove('hidden');

        // ========== 步骤4: 记录使用 ==========
        await recordUsage(TOOL_ID);

        // ========== 步骤5: 更新剩余次数 ==========
        await initUsageCheck();

      } catch (error) {
        showError('咨询失败：' + error.message);
        console.error(error);
      } finally {
        consultBtn.disabled = false;
        btnTextEl.innerText = '获取职业建议';
        spinnerEl.classList.add('hidden');
      }
    };
  </script>
</body>
</html>`
    }
  ]

  // ============================================================================
  // 页面渲染
  // ============================================================================

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">前端集成开发指南</h1>
              <p className="text-gray-600 mt-1">完整的API接口文档和三种场景的HTML工具开发示例</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl space-y-8">

          {/* 概览 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">概览</h2>
            </div>
            <p className="text-gray-700 mb-4">
              本平台提供完整的API接口，支持使用限制追踪和AI功能调用。所有工具都需要集成使用限制系统，AI工具还需要调用AI接口。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">核心特性：</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>自动使用限制追踪（登录用户和访客）</li>
                <li>设备级指纹识别（WebGL + 硬件特征，跨浏览器一致）</li>
                <li>设备指纹 + IP 双重验证（防止绕过限制）</li>
                <li>支持多种AI模型（OpenAI、Claude、Gemini等）</li>
                <li>完整的订阅计划支持</li>
                <li>iframe环境自动适配</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">🛡️ 安全机制（针对未登录用户）：</h3>
              <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
                <li><strong>设备级指纹识别</strong>：基于硬件特征（WebGL/GPU、CPU核心数、设备内存、屏幕分辨率等），同一设备不同浏览器生成相同ID</li>
                <li><strong>跨浏览器识别</strong>：用户从Chrome切换到Firefox/Edge，系统仍能识别为同一设备，共享使用次数</li>
                <li><strong>设备指纹 + IP 组合键</strong>：数据库使用 (fingerprint, IP) 作为唯一标识，每个设备在每个IP下只有一条记录</li>
                <li><strong>高效查询</strong>：无需聚合多条记录，直接查询单条记录即可获取使用次数</li>
                <li><strong>自动过期重置</strong>：访客使用记录会在设定天数后自动重置</li>
              </ul>
            </div>
          </section>

          {/* API接口文档 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">API接口文档</h2>
            </div>

            <div className="space-y-6">
              {/* 使用限制API */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. 使用限制API</h3>

                {/* Check Usage */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-mono rounded">GET</span>
                    <code className="text-sm font-mono text-gray-900">/api/usage/check</code>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm">检查用户是否有剩余使用次数（不记录使用）</p>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Query Parameters:</h4>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr>
                          <td className="font-mono text-gray-900 py-1">toolId</td>
                          <td className="text-gray-600 py-1">工具ID（必需）</td>
                        </tr>
                        <tr>
                          <td className="font-mono text-gray-900 py-1">fingerprint</td>
                          <td className="text-gray-600 py-1">浏览器指纹（访客必需）</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Response Example:</h4>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
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
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-mono rounded">POST</span>
                    <code className="text-sm font-mono text-gray-900">/api/usage/record</code>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm">记录工具使用并增加计数器</p>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Request Body:</h4>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`{
  "toolId": 1,
  "fingerprint": "abc123"
}`}
                    </pre>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Response Example:</h4>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
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

              {/* AI调用API */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. AI调用API</h3>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-mono rounded">POST</span>
                    <code className="text-sm font-mono text-gray-900">/api/ai/chat</code>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm">调用AI生成内容</p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ 重要：</strong>此接口<strong>不会自动记录使用次数</strong>。必须在AI调用成功后手动调用 <code className="bg-yellow-100 px-1 rounded">/api/usage/record</code> 来记录使用。这样可以避免AI调用失败但仍然扣除次数的问题。
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Request Body:</h4>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`{
  "messages": [
    {
      "role": "system",
      "content": "你是一个helpful助手"
    },
    {
      "role": "user",
      "content": "用户的问题"
    }
  ],
  "temperature": 0.7,
  "maxTokens": 2000,
  "fingerprint": "abc123"  // 访客必需
}`}
                    </pre>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Response Example:</h4>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`{
  "content": "AI的回复内容（Markdown格式）"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 核心代码片段 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">核心代码片段</h2>
            </div>
            <p className="text-gray-600 mb-4">以下是所有工具都需要的核心JavaScript代码片段，可以直接复制使用：</p>

            <div className="space-y-4">
              {/* 浏览器指纹 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">生成浏览器指纹</span>
                  <button
                    onClick={() => copyToClipboard(fingerprintCode, 'fingerprint')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {copiedCode === 'fingerprint' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === 'fingerprint' ? '已复制' : '复制代码'}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                  {fingerprintCode}
                </pre>
              </div>

              {/* 获取工具ID */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">获取工具ID（支持iframe）</span>
                  <button
                    onClick={() => copyToClipboard(getToolIdCode, 'getToolId')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {copiedCode === 'getToolId' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === 'getToolId' ? '已复制' : '复制代码'}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                  {getToolIdCode}
                </pre>
              </div>

              {/* 检查使用限制 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">检查使用限制</span>
                  <button
                    onClick={() => copyToClipboard(checkUsageCode, 'checkUsage')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {copiedCode === 'checkUsage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === 'checkUsage' ? '已复制' : '复制代码'}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                  {checkUsageCode}
                </pre>
              </div>

              {/* 记录使用 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">记录使用</span>
                  <button
                    onClick={() => copyToClipboard(recordUsageCode, 'recordUsage')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {copiedCode === 'recordUsage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === 'recordUsage' ? '已复制' : '复制代码'}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                  {recordUsageCode}
                </pre>
              </div>
            </div>
          </section>

          {/* 内容过滤代码片段 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">内容过滤代码片段（防滥用）</h2>
            </div>
            <p className="text-gray-600 mb-4">
              适用于特定主题的AI工具（如职业规划、法律咨询等），防止用户发送与工具主题无关的内容，避免AI资源被滥用。
            </p>

            <div className="space-y-4">
              {/* 基础内容过滤 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">基础内容过滤（关键词匹配）</span>
                  <button
                    onClick={() => copyToClipboard(contentFilterCode, 'contentFilter')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {copiedCode === 'contentFilter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === 'contentFilter' ? '已复制' : '复制代码'}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto max-h-96">
                  {contentFilterCode}
                </pre>
              </div>

              {/* 高级AI过滤 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">高级内容过滤（AI判断）</span>
                  <button
                    onClick={() => copyToClipboard(advancedFilterCode, 'advancedFilter')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {copiedCode === 'advancedFilter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === 'advancedFilter' ? '已复制' : '复制代码'}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto max-h-96">
                  {advancedFilterCode}
                </pre>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">使用建议：</h3>
              <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                <li>基础过滤：适合大多数场景，速度快，不消耗AI资源</li>
                <li>高级过滤：适合需要精确判断的场景，但会消耗额外的AI调用次数</li>
                <li>建议先使用基础过滤，只在必要时才使用高级过滤</li>
                <li>根据工具主题自定义关键词白名单和黑名单</li>
              </ul>
            </div>
          </section>

          {/* 完整场景示例 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">完整场景示例</h2>
            </div>
            <p className="text-gray-600 mb-6">
              以下是五种常见场景的完整HTML代码示例，可以直接复制使用。每个示例都包含完整的HTML、CSS和JavaScript代码。
            </p>

            <div className="space-y-6">
              {examples.map((example, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{example.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedExample(expandedExample === index ? null : index)}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          {expandedExample === index ? '收起代码' : '展开代码'}
                        </button>
                        <button
                          onClick={() => copyToClipboard(example.code, `example-${index}`)}
                          className="px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 flex items-center gap-1"
                        >
                          {copiedCode === `example-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedCode === `example-${index}` ? '已复制' : '复制代码'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedExample === index && (
                    <>
                      <pre className="p-4 bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-96">
                        {example.code}
                      </pre>

                      {/* 使用指南 */}
                      <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          小白使用指南
                        </h4>

                        {/* 快速开始 */}
                        <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-green-500">
                          <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                            快速开始
                          </h5>
                          <div className="text-sm text-gray-700 space-y-2 ml-8">
                            <p><strong>步骤1：</strong>点击上方"复制代码"按钮，复制完整代码</p>
                            <p><strong>步骤2：</strong>创建新文件 <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {index === 0 && 'my-tool.html'}
                              {index === 1 && 'my-ai-tool.html'}
                              {index === 2 && 'my-hybrid-tool.html'}
                              {index === 3 && 'my-admin-tool.html'}
                              {index === 4 && 'my-filtered-tool.html'}
                            </code>，粘贴代码</p>
                            <p><strong>步骤3：</strong>修改下方标记为"✏️ 可修改"的部分，实现你的业务逻辑</p>
                            <p><strong>步骤4：</strong>保存文件，在浏览器中打开测试</p>
                          </div>
                        </div>

                        {/* 可修改部分 */}
                        <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                          <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                            ✏️ 可以修改的部分（业务逻辑）
                          </h5>
                          <div className="text-sm text-gray-700 ml-8">
                            <ul className="list-disc list-inside space-y-1">
                              {index === 0 && (
                                <>
                                  <li><strong>标题和描述</strong>：修改 <code className="bg-gray-100 px-1 rounded">&lt;h1&gt;</code> 和 <code className="bg-gray-100 px-1 rounded">&lt;p&gt;</code> 标签中的文字</li>
                                  <li><strong>输入框提示</strong>：修改 <code className="bg-gray-100 px-1 rounded">placeholder</code> 属性</li>
                                  <li><strong>核心功能</strong>：修改 <code className="bg-gray-100 px-1 rounded">const result = text.toUpperCase();</code> 这一行，实现你的转换逻辑</li>
                                  <li><strong>样式调整</strong>：修改 Tailwind CSS 类名来改变外观</li>
                                </>
                              )}
                              {index === 1 && (
                                <>
                                  <li><strong>标题和描述</strong>：修改工具名称和说明文字</li>
                                  <li><strong>输入框标签</strong>：修改"文案主题"为你需要的输入提示</li>
                                  <li><strong>AI提示词</strong>：修改 <code className="bg-gray-100 px-1 rounded">system</code> 消息中的提示词，定制AI行为</li>
                                  <li><strong>用户提示</strong>：修改 <code className="bg-gray-100 px-1 rounded">user</code> 消息的模板</li>
                                  <li><strong>AI参数</strong>：调整 <code className="bg-gray-100 px-1 rounded">temperature</code> (0-1) 和 <code className="bg-gray-100 px-1 rounded">maxTokens</code></li>
                                </>
                              )}
                              {index === 2 && (
                                <>
                                  <li><strong>普通功能按钮</strong>：修改"转大写"/"转小写"为你的功能</li>
                                  <li><strong>普通功能逻辑</strong>：修改 <code className="bg-gray-100 px-1 rounded">upperBtn.onclick</code> 和 <code className="bg-gray-100 px-1 rounded">lowerBtn.onclick</code> 中的处理逻辑</li>
                                  <li><strong>AI功能按钮</strong>：修改"AI智能优化"为你的AI功能名称</li>
                                  <li><strong>AI提示词</strong>：修改 <code className="bg-gray-100 px-1 rounded">system</code> 消息定制AI行为</li>
                                </>
                              )}
                              {index === 3 && (
                                <>
                                  <li><strong>工具标题</strong>：修改"AI内容生成器"为你的工具名称</li>
                                  <li><strong>输入标签</strong>：修改"输入提示词"为你需要的标签</li>
                                  <li><strong>高级参数</strong>：可以添加更多AI参数控制（如 top_p, frequency_penalty 等）</li>
                                  <li><strong>AI提示词</strong>：修改 <code className="bg-gray-100 px-1 rounded">system</code> 消息定制AI角色</li>
                                </>
                              )}
                              {index === 4 && (
                                <>
                                  <li><strong>工具主题</strong>：修改"职业规划"为你的主题（如"法律咨询"、"健康咨询"）</li>
                                  <li><strong>关键词白名单</strong>：修改 <code className="bg-gray-100 px-1 rounded">relevantKeywords</code> 数组，添加你的主题相关词</li>
                                  <li><strong>关键词黑名单</strong>：修改 <code className="bg-gray-100 px-1 rounded">irrelevantTopics</code> 数组，添加无关话题</li>
                                  <li><strong>错误提示</strong>：修改拒绝原因的文案</li>
                                  <li><strong>AI提示词</strong>：修改 <code className="bg-gray-100 px-1 rounded">system</code> 消息定制AI专业角色</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* 不要修改部分 */}
                        <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-red-500">
                          <h5 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                            <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                            ⚠️ 不要修改的部分（核心框架）
                          </h5>
                          <div className="text-sm text-gray-700 ml-8">
                            <ul className="list-disc list-inside space-y-1">
                              <li><code className="bg-gray-100 px-1 rounded">getToolId()</code> 函数 - 自动获取工具ID</li>
                              <li><code className="bg-gray-100 px-1 rounded">generateFingerprint()</code> 函数 - 生成设备指纹</li>
                              <li><code className="bg-gray-100 px-1 rounded">checkUsage()</code> 函数 - 检查使用限制</li>
                              <li><code className="bg-gray-100 px-1 rounded">recordUsage()</code> 函数 - 记录使用次数</li>
                              <li><code className="bg-gray-100 px-1 rounded">initUsageCheck()</code> 函数 - 初始化检查</li>
                              <li><code className="bg-gray-100 px-1 rounded">&lt;script src="/js/fingerprint.js"&gt;</code> - 指纹库引用</li>
                              {(index === 1 || index === 2 || index === 4) && (
                                <>
                                  <li>AI调用后的 <code className="bg-gray-100 px-1 rounded">await recordUsage(TOOL_ID)</code> - 必须保留</li>
                                  <li>AI调用前的 <code className="bg-gray-100 px-1 rounded">await checkUsage(TOOL_ID)</code> - 必须保留</li>
                                </>
                              )}
                            </ul>
                            <p className="mt-2 text-red-600 font-semibold">❌ 删除这些代码会导致使用限制失效！</p>
                          </div>
                        </div>

                        {/* 测试访问 */}
                        <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                          <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                            <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                            测试访问
                          </h5>
                          <div className="text-sm text-gray-700 ml-8 space-y-2">
                            <p><strong>本地测试：</strong></p>
                            <div className="p-2 bg-gray-50 rounded font-mono text-xs">
                              {index === 0 && 'http://localhost:3000/tools/1/my-tool.html'}
                              {index === 1 && 'http://localhost:3000/tools/2/my-ai-tool.html'}
                              {index === 2 && 'http://localhost:3000/tools/3/my-hybrid-tool.html'}
                              {index === 3 && 'http://localhost:3000/admin/tools/my-admin-tool'}
                              {index === 4 && 'http://localhost:3000/tools/5/my-filtered-tool.html'}
                            </div>
                            <p className="text-xs text-gray-600">
                              <strong>提示：</strong>
                              {index === 0 && '此工具为纯前端处理，不调用AI，但仍需记录使用次数。适合文本转换、格式化等简单操作。'}
                              {index === 1 && '每次生成消耗1次使用次数。游客默认10次/30天，FREE会员50次/月，PREMIUM会员500次/月。'}
                              {index === 2 && '混合模式：普通功能免费无限使用，AI功能按次数计费。适合提供基础+高级功能的工具。'}
                              {index === 3 && '管理员专用版本：系统通过session自动识别管理员身份，无需检查使用限制。仅适用于管理后台内部工具。'}
                              {index === 4 && '内容过滤在客户端执行，不消耗API调用。只有通过过滤的内容才会调用AI并记录使用次数。'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 使用限制说明 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">默认使用限制</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">用户类型</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">限制</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">重置周期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">访客（未注册）</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{config.guestUsageLimit} 次</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{config.guestResetDays} 天</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">FREE 会员</td>
                    <td className="px-4 py-3 text-sm text-gray-600">50 次</td>
                    <td className="px-4 py-3 text-sm text-gray-600">每月1日重置</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">PREMIUM 会员</td>
                    <td className="px-4 py-3 text-sm text-gray-600">500 次</td>
                    <td className="px-4 py-3 text-sm text-gray-600">每月1日重置</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">ENTERPRISE 会员</td>
                    <td className="px-4 py-3 text-sm text-gray-600">无限制</td>
                    <td className="px-4 py-3 text-sm text-gray-600">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              * 访客限制可在全局设置中配置
            </p>
          </section>

          {/* 社交媒体分享功能 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">社交媒体分享功能</h2>
            </div>
            <p className="text-gray-700 mb-4">
              平台提供完整的社交媒体分享功能，支持将工具生成的结果自动转换为图片，一键分享到海外主流社交平台。
            </p>

            {/* 功能特性 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">✨ 核心特性：</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-2 text-sm">
                <li><strong>自动生成图片</strong>：使用 html2canvas 将结果内容转换为高清图片</li>
                <li><strong>15+ 社交平台</strong>：支持 Twitter、Facebook、LinkedIn、WhatsApp、Telegram、Reddit、Pinterest、Email、Tumblr、VK、Instagram、TikTok 等</li>
                <li><strong>react-share 集成</strong>：使用业界标准的 react-share 库，稳定可靠</li>
                <li><strong>本地下载</strong>：支持将图片下载到本地</li>
                <li><strong>移动端优化</strong>：支持 Web Share API，移动端体验更佳</li>
                <li><strong>跨平台兼容</strong>：桌面端和移动端均可使用</li>
              </ul>
            </div>

            {/* 使用方法 */}
            <div className="space-y-6">
              {/* React/Next.js 组件方式 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">方式一：React/Next.js 组件（推荐）</h3>
                <p className="text-sm text-gray-600 mb-3">适用于 Next.js 页面组件，使用 react-share 库支持 15+ 社交平台。</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">1. 导入组件</h4>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`import SocialShare from '@/components/SocialShare'`}
                  </pre>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">2. 在结果区域使用</h4>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`<div id="output" className="mt-6">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700">
      生成结果
    </label>

    {/* 添加分享按钮 */}
    <SocialShare
      resultElementId="result-content"
      toolName="我的工具名称"
    />
  </div>

  {/* 结果内容（需要截图的部分） */}
  <div id="result-content" className="p-4 bg-gray-50 border rounded-lg">
    <p>这里是工具生成的结果...</p>
  </div>
</div>`}
                  </pre>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">3. 参数说明</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 font-mono text-xs">参数</th>
                        <th className="text-left p-2">说明</th>
                        <th className="text-left p-2">必需</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">resultElementId</td>
                        <td className="p-2 text-gray-600">要截图的元素ID</td>
                        <td className="p-2 text-green-600">是</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">toolName</td>
                        <td className="p-2 text-gray-600">工具名称（用于分享文案）</td>
                        <td className="p-2 text-green-600">是</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HTML 工具方式 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">方式二：HTML 工具（iframe 内部）</h3>
                <p className="text-sm text-gray-600 mb-3">适用于纯 HTML 工具，使用 JavaScript 库实现分享功能。</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">1. 引入分享库</h4>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`<!-- 在 HTML 的 <head> 或 </body> 前引入 -->
<script src="/js/social-share.js"></script>`}
                  </pre>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">2. 添加分享按钮</h4>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`<!-- 结果区域 -->
<div id="output" class="mt-6">
  <div class="flex items-center justify-between mb-2">
    <label>Result</label>

    <!-- 分享按钮 -->
    <button
      onclick="SocialShare.showShareDialog('result-content', 'My Tool')"
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      📤 Share
    </button>
  </div>

  <!-- 结果内容（需要截图的部分） -->
  <div id="result-content" class="p-4 bg-gray-50 border rounded-lg">
    <p>Your generated result here...</p>
  </div>
</div>`}
                  </pre>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">3. API 方法说明</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-3">
                      <p className="font-mono text-xs text-gray-900 mb-1">
                        SocialShare.showShareDialog(elementId, toolName)
                      </p>
                      <p className="text-xs text-gray-600">显示分享弹窗（推荐使用）</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-3">
                      <p className="font-mono text-xs text-gray-900 mb-1">
                        SocialShare.downloadImage(elementId, filename)
                      </p>
                      <p className="text-xs text-gray-600">直接下载图片到本地</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-3">
                      <p className="font-mono text-xs text-gray-900 mb-1">
                        SocialShare.shareToSocial(platform, elementId, toolName)
                      </p>
                      <p className="text-xs text-gray-600">分享到指定平台（twitter, facebook, instagram, tiktok, linkedin, whatsapp, telegram）</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">4. 完整示例</h4>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-64">
{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tool with Share Feature</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">My Tool</h1>

    <!-- Input Area -->
    <div class="mb-4">
      <textarea id="input" rows="4" class="w-full p-3 border rounded-lg"
                placeholder="Enter text..."></textarea>
    </div>

    <button
      onclick="generateResult()"
      class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
    >
      Generate Result
    </button>

    <!-- Result Area -->
    <div id="output" class="hidden mt-6">
      <div class="flex items-center justify-between mb-2">
        <label class="font-semibold">Result</label>
        <!-- Share button -->
        <button
          onclick="SocialShare.showShareDialog('result-content', 'My Tool')"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📤 Share
        </button>
      </div>

      <div id="result-content" class="p-6 bg-white border rounded-lg shadow">
        <h2 class="text-xl font-bold mb-2">Result</h2>
        <p id="result-text"></p>
      </div>
    </div>
  </div>

  <!-- Include share library -->
  <script src="/js/social-share.js"></script>

  <script>
    function generateResult() {
      const input = document.getElementById('input').value;
      const result = input.toUpperCase(); // Example: convert to uppercase

      document.getElementById('result-text').innerText = result;
      document.getElementById('output').classList.remove('hidden');
    }
  </script>
</body>
</html>`}
                  </pre>
                </div>
              </div>
            </div>

            {/* 支持的平台 */}
            <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">🌐 支持的社交平台（15+）：</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">𝕏</span>
                  <span className="text-gray-700">Twitter (X)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-blue-600">f</span>
                  <span className="text-gray-700">Facebook</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-blue-700">in</span>
                  <span className="text-gray-700">LinkedIn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-green-600">💬</span>
                  <span className="text-gray-700">WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-blue-500">✈️</span>
                  <span className="text-gray-700">Telegram</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-orange-600">🔴</span>
                  <span className="text-gray-700">Reddit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-red-600">📌</span>
                  <span className="text-gray-700">Pinterest</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📧</span>
                  <span className="text-gray-700">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-blue-800">t</span>
                  <span className="text-gray-700">Tumblr</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-blue-600">VK</span>
                  <span className="text-gray-700">VKontakte</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📷</span>
                  <span className="text-gray-700">Instagram</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎵</span>
                  <span className="text-gray-700">TikTok</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📥</span>
                  <span className="text-gray-700">本地下载</span>
                </div>
              </div>
            </div>

            {/* 注意事项 */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 注意事项：</h3>
              <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                <li><strong>Instagram/TikTok</strong>：由于平台限制，需要先下载图片后手动上传到应用</li>
                <li><strong>移动端</strong>：支持 Web Share API，可直接调用系统分享功能</li>
                <li><strong>图片质量</strong>：默认使用 2x scale 提高清晰度，适合高分辨率屏幕</li>
                <li><strong>元素ID</strong>：确保要截图的元素有唯一的 ID 属性</li>
              </ul>
            </div>
          </section>

          {/* 最佳实践 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">最佳实践</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">操作前检查</p>
                  <p className="text-gray-600 text-sm">始终在执行工具操作前调用 <code className="bg-gray-100 px-1 rounded">/api/usage/check</code>，避免浪费资源。</p>
                  <p className="text-gray-600 text-sm mt-2"><strong>安全提示：</strong>系统使用设备级指纹识别（基于硬件特征：WebGL/GPU、CPU、内存等），同一设备不同浏览器生成相同ID，有效防止用户通过更换浏览器绕过使用限制。</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">成功后记录</p>
                  <p className="text-gray-600 text-sm">只在工具操作成功完成后调用 <code className="bg-gray-100 px-1 rounded">/api/usage/record</code>，避免记录失败的操作。</p>
                  <p className="text-gray-600 text-sm mt-2"><strong>特别注意：</strong><code className="bg-gray-100 px-1 rounded">/api/ai/chat</code> 接口不会自动记录使用次数，必须在AI调用成功后手动调用 <code className="bg-gray-100 px-1 rounded">/api/usage/record</code>。这样可以避免AI调用失败但仍然扣除次数的问题。</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">显示剩余次数</p>
                  <p className="text-gray-600 text-sm">在页面显眼位置显示剩余使用次数，提醒用户注册获取更多次数。</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-900">错误处理</p>
                  <p className="text-gray-600 text-sm">使用 try-catch 处理所有API调用，向用户显示友好的错误提示。</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  5
                </div>
                <div>
                  <p className="font-semibold text-gray-900">AI调用优化</p>
                  <p className="text-gray-600 text-sm">使用 <code className="bg-gray-100 px-1 rounded">marked</code> 库渲染AI返回的Markdown内容，合理设置 temperature 和 maxTokens 参数。</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </AdminLayout>
  );
}
