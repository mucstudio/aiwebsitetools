'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Code, Copy, Check } from 'lucide-react';

export default function AIExamplesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (!data.authenticated) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const examples = [
    {
      title: '基础调用示例',
      description: '使用默认模型进行简单的 AI 对话',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 基础调用示例</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
        }
        textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        button:hover {
            background: #2563eb;
        }
        button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .response {
            margin-top: 20px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 4px;
            white-space: pre-wrap;
        }
        .error {
            background: #fee2e2;
            color: #dc2626;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI 基础调用示例</h1>
        <p>输入你的问题，AI 将为你解答：</p>

        <textarea id="userInput" placeholder="例如：介绍一下人工智能的发展历史"></textarea>
        <button id="sendBtn" onclick="sendMessage()">发送</button>

        <div id="response" class="response" style="display: none;"></div>
    </div>

    <script>
        async function sendMessage() {
            const input = document.getElementById('userInput').value;
            const responseDiv = document.getElementById('response');
            const sendBtn = document.getElementById('sendBtn');

            if (!input.trim()) {
                alert('请输入问题');
                return;
            }

            // 禁用按钮，显示加载状态
            sendBtn.disabled = true;
            sendBtn.textContent = '处理中...';
            responseDiv.style.display = 'block';
            responseDiv.className = 'response';
            responseDiv.textContent = '正在思考...';

            try {
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'user',
                                content: input
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }

                const data = await response.json();
                responseDiv.textContent = data.content;
            } catch (error) {
                responseDiv.className = 'response error';
                responseDiv.textContent = '错误：' + error.message;
            } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = '发送';
            }
        }

        // 支持回车发送
        document.getElementById('userInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    </script>
</body>
</html>`
    },
    {
      title: '文本优化工具',
      description: '使用 AI 优化和改进用户输入的文本',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 文本优化工具</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1000px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .panel {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
        }
        h2 {
            margin-top: 0;
        }
        textarea {
            width: 100%;
            min-height: 200px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            resize: vertical;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
            width: 100%;
        }
        button:hover {
            background: #2563eb;
        }
        button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .output {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 4px;
            min-height: 200px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h1 style="text-align: center;">AI 文本优化工具</h1>

    <div class="container">
        <div class="panel">
            <h2>原始文本</h2>
            <textarea id="inputText" placeholder="输入需要优化的文本..."></textarea>
            <button onclick="optimizeText()">优化文本</button>
        </div>

        <div class="panel">
            <h2>优化后的文本</h2>
            <div id="outputText" class="output">优化结果将显示在这里...</div>
        </div>
    </div>

    <script>
        async function optimizeText() {
            const input = document.getElementById('inputText').value;
            const output = document.getElementById('outputText');

            if (!input.trim()) {
                alert('请输入需要优化的文本');
                return;
            }

            output.textContent = '正在优化...';

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
                                content: '你是一个专业的文本优化助手。请优化用户提供的文本，使其更加流畅、专业、易读。保持原意，但改进表达方式、语法和结构。'
                            },
                            {
                                role: 'user',
                                content: '请优化以下文本：\\n\\n' + input
                            }
                        ],
                        temperature: 0.7,
                        maxTokens: 2000
                    })
                });

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }

                const data = await response.json();
                output.textContent = data.content;
            } catch (error) {
                output.textContent = '错误：' + error.message;
                output.style.color = '#dc2626';
            }
        }
    </script>
</body>
</html>`
    },
    {
      title: '智能翻译工具',
      description: '使用 AI 进行多语言翻译',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 智能翻译工具</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1000px;
            margin: 50px auto;
            padding: 20px;
        }
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            align-items: center;
        }
        select {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .panel {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
        }
        textarea {
            width: 100%;
            min-height: 250px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            resize: vertical;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        button:hover {
            background: #2563eb;
        }
        button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .output {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 4px;
            min-height: 250px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h1 style="text-align: center;">AI 智能翻译工具</h1>

    <div class="controls">
        <label>源语言：</label>
        <select id="sourceLang">
            <option value="auto">自动检测</option>
            <option value="中文">中文</option>
            <option value="英语">英语</option>
            <option value="日语">日语</option>
            <option value="韩语">韩语</option>
            <option value="法语">法语</option>
            <option value="德语">德语</option>
            <option value="西班牙语">西班牙语</option>
        </select>

        <span>→</span>

        <label>目标语言：</label>
        <select id="targetLang">
            <option value="英语">英语</option>
            <option value="中文">中文</option>
            <option value="日语">日语</option>
            <option value="韩语">韩语</option>
            <option value="法语">法语</option>
            <option value="德语">德语</option>
            <option value="西班牙语">西班牙语</option>
        </select>

        <button onclick="translate()">翻译</button>
    </div>

    <div class="container">
        <div class="panel">
            <h2>原文</h2>
            <textarea id="sourceText" placeholder="输入需要翻译的文本..."></textarea>
        </div>

        <div class="panel">
            <h2>译文</h2>
            <div id="translatedText" class="output">翻译结果将显示在这里...</div>
        </div>
    </div>

    <script>
        async function translate() {
            const sourceText = document.getElementById('sourceText').value;
            const sourceLang = document.getElementById('sourceLang').value;
            const targetLang = document.getElementById('targetLang').value;
            const output = document.getElementById('translatedText');

            if (!sourceText.trim()) {
                alert('请输入需要翻译的文本');
                return;
            }

            output.textContent = '正在翻译...';

            const prompt = sourceLang === 'auto'
                ? \`请将以下文本翻译成\${targetLang}：\\n\\n\${sourceText}\`
                : \`请将以下\${sourceLang}文本翻译成\${targetLang}：\\n\\n\${sourceText}\`;

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
                                content: '你是一个专业的翻译助手。请提供准确、流畅、符合目标语言习惯的翻译。只返回翻译结果，不要添加任何解释。'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.3,
                        maxTokens: 2000
                    })
                });

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }

                const data = await response.json();
                output.textContent = data.content;
            } catch (error) {
                output.textContent = '错误：' + error.message;
                output.style.color = '#dc2626';
            }
        }
    </script>
</body>
</html>`
    },
    {
      title: '调用用户信息 - 只使用姓名',
      description: '获取当前登录用户的姓名，发送给 AI 生成个性化内容',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 个性化问候</title>
    <script src="/user-api.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        button:hover {
            background: #2563eb;
        }
        button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .response {
            margin-top: 20px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 4px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI 个性化问候生成器</h1>
        <p>点击按钮，AI 将根据你的姓名生成个性化问候语</p>

        <button id="generateBtn" onclick="generateGreeting()">生成问候语</button>

        <div id="response" class="response" style="display: none;"></div>
    </div>

    <script>
        async function generateGreeting() {
            const responseDiv = document.getElementById('response');
            const generateBtn = document.getElementById('generateBtn');

            // 禁用按钮
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';
            responseDiv.style.display = 'block';
            responseDiv.textContent = '正在获取用户信息...';

            try {
                // 1. 获取用户基本信息（只包含姓名、邮箱等）
                const userInfo = await UserAPI.getUserBasicInfo();

                if (!userInfo) {
                    responseDiv.textContent = '请先登录后再使用此功能';
                    return;
                }

                responseDiv.textContent = '正在生成个性化内容...';

                // 2. 构建 AI 提示词，只包含用户姓名
                const prompt = \`用户姓名：\${userInfo.name}

请为这位用户生成一段温暖、个性化的问候语，要体现出对用户的尊重和关注。\`;

                // 3. 调用 AI API
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个友好的助手，擅长生成温暖、个性化的问候语。'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.8,
                        maxTokens: 200
                    })
                });

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }

                const data = await response.json();
                responseDiv.textContent = data.content;
            } catch (error) {
                responseDiv.textContent = '错误：' + error.message;
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = '生成问候语';
            }
        }
    </script>
</body>
</html>`
    },
    {
      title: '调用用户信息 - 姓名+社交账号',
      description: '获取用户的姓名和社交媒体账号，生成社交媒体个人简介',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 社交媒体简介生成器</title>
    <script src="/user-api.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
        }
        .user-info {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        button:hover {
            background: #2563eb;
        }
        button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .response {
            margin-top: 20px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 4px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI 社交媒体简介生成器</h1>
        <p>根据你的姓名和社交媒体账号，AI 将为你生成专业的个人简介</p>

        <div id="userInfo" class="user-info" style="display: none;">
            <h3>当前用户信息：</h3>
            <div id="userInfoContent"></div>
        </div>

        <button id="generateBtn" onclick="generateBio()">生成社交媒体简介</button>

        <div id="response" class="response" style="display: none;"></div>
    </div>

    <script>
        async function generateBio() {
            const responseDiv = document.getElementById('response');
            const generateBtn = document.getElementById('generateBtn');
            const userInfoDiv = document.getElementById('userInfo');
            const userInfoContent = document.getElementById('userInfoContent');

            // 禁用按钮
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';
            responseDiv.style.display = 'block';
            responseDiv.textContent = '正在获取用户信息...';

            try {
                // 1. 获取用户基本信息
                const basicInfo = await UserAPI.getUserBasicInfo();

                // 2. 获取用户社交媒体信息
                const socialMedia = await UserAPI.getUserSocialMedia();

                if (!basicInfo) {
                    responseDiv.textContent = '请先登录后再使用此功能';
                    return;
                }

                // 显示用户信息
                userInfoDiv.style.display = 'block';
                let infoHTML = \`<p><strong>姓名：</strong>\${basicInfo.name}</p>\`;
                if (socialMedia) {
                    if (socialMedia.tiktok) infoHTML += \`<p><strong>TikTok：</strong>\${socialMedia.tiktok}</p>\`;
                    if (socialMedia.instagram) infoHTML += \`<p><strong>Instagram：</strong>\${socialMedia.instagram}</p>\`;
                    if (socialMedia.twitter) infoHTML += \`<p><strong>Twitter：</strong>\${socialMedia.twitter}</p>\`;
                    if (socialMedia.youtube) infoHTML += \`<p><strong>YouTube：</strong>\${socialMedia.youtube}</p>\`;
                }
                userInfoContent.innerHTML = infoHTML;

                responseDiv.textContent = '正在生成个性化简介...';

                // 3. 构建 AI 提示词
                let prompt = \`用户信息：
姓名：\${basicInfo.name}\`;

                if (socialMedia) {
                    prompt += \`\\n\\n社交媒体账号：\`;
                    if (socialMedia.tiktok) prompt += \`\\n- TikTok: \${socialMedia.tiktok}\`;
                    if (socialMedia.instagram) prompt += \`\\n- Instagram: \${socialMedia.instagram}\`;
                    if (socialMedia.twitter) prompt += \`\\n- Twitter: \${socialMedia.twitter}\`;
                    if (socialMedia.youtube) prompt += \`\\n- YouTube: \${socialMedia.youtube}\`;
                }

                prompt += \`\\n\\n请根据以上信息，为这位用户生成一段专业、吸引人的社交媒体个人简介（150字以内）。\`;

                // 4. 调用 AI API
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个专业的社交媒体文案专家，擅长撰写吸引人的个人简介。'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        maxTokens: 300
                    })
                });

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }

                const data = await response.json();
                responseDiv.textContent = data.content;
            } catch (error) {
                responseDiv.textContent = '错误：' + error.message;
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = '生成社交媒体简介';
            }
        }
    </script>
</body>
</html>`
    },
    {
      title: '调用用户信息 - 完整信息（推荐）',
      description: '使用 formatUserInfoForAI 方法获取格式化的完整用户信息',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 个性化内容生成器</title>
    <script src="/user-api.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1000px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
        }
        .options {
            margin: 20px 0;
            padding: 15px;
            background: #f9fafb;
            border-radius: 4px;
        }
        .checkbox-group {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }
        textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            margin-top: 10px;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        button:hover {
            background: #2563eb;
        }
        button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .response {
            margin-top: 20px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 4px;
            white-space: pre-wrap;
        }
        .user-preview {
            margin-top: 15px;
            padding: 10px;
            background: #e5e7eb;
            border-radius: 4px;
            font-size: 12px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI 个性化内容生成器（完整版）</h1>
        <p>根据你的完整个人信息，AI 将生成高度个性化的内容</p>

        <div class="options">
            <h3>选择要包含的用户信息：</h3>
            <div class="checkbox-group">
                <label>
                    <input type="checkbox" id="includeBasic" checked> 基本信息（姓名、邮箱、地址等）
                </label>
                <label>
                    <input type="checkbox" id="includeSocial" checked> 社交媒体账号
                </label>
                <label>
                    <input type="checkbox" id="includeBio" checked> 个人简介
                </label>
            </div>
            <button onclick="previewUserInfo()" style="margin-top: 10px; background: #6b7280;">预览用户信息</button>
            <div id="userPreview" class="user-preview" style="display: none;"></div>
        </div>

        <label><strong>你想让 AI 生成什么内容？</strong></label>
        <textarea id="userRequest" placeholder="例如：为我生成一份专业的个人介绍，用于求职简历"></textarea>

        <button id="generateBtn" onclick="generateContent()">生成内容</button>

        <div id="response" class="response" style="display: none;"></div>
    </div>

    <script>
        // 预览用户信息
        async function previewUserInfo() {
            const userPreview = document.getElementById('userPreview');
            userPreview.style.display = 'block';
            userPreview.textContent = '正在加载...';

            try {
                const includeBasic = document.getElementById('includeBasic').checked;
                const includeSocial = document.getElementById('includeSocial').checked;
                const includeBio = document.getElementById('includeBio').checked;

                // 使用 formatUserInfoForAI 方法获取格式化的用户信息
                const userInfo = await UserAPI.formatUserInfoForAI({
                    includeBasicInfo: includeBasic,
                    includeSocialMedia: includeSocial,
                    includeBio: includeBio
                });

                userPreview.textContent = '将发送给 AI 的用户信息：\\n\\n' + userInfo;
            } catch (error) {
                userPreview.textContent = '错误：' + error.message;
            }
        }

        async function generateContent() {
            const responseDiv = document.getElementById('response');
            const generateBtn = document.getElementById('generateBtn');
            const userRequest = document.getElementById('userRequest').value;

            if (!userRequest.trim()) {
                alert('请输入你想让 AI 生成的内容');
                return;
            }

            // 禁用按钮
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';
            responseDiv.style.display = 'block';
            responseDiv.textContent = '正在获取用户信息...';

            try {
                // 获取用户选择的选项
                const includeBasic = document.getElementById('includeBasic').checked;
                const includeSocial = document.getElementById('includeSocial').checked;
                const includeBio = document.getElementById('includeBio').checked;

                // 使用 formatUserInfoForAI 方法 - 这是最推荐的方式！
                const userInfo = await UserAPI.formatUserInfoForAI({
                    includeBasicInfo: includeBasic,
                    includeSocialMedia: includeSocial,
                    includeBio: includeBio
                });

                if (userInfo === 'User is not logged in.') {
                    responseDiv.textContent = '请先登录后再使用此功能';
                    return;
                }

                responseDiv.textContent = '正在生成个性化内容...';

                // 构建完整的 AI 提示词
                const prompt = \`\${userInfo}

用户需求：\${userRequest}

请根据以上用户信息，生成符合用户需求的个性化内容。\`;

                // 调用 AI API
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个专业的内容创作助手，擅长根据用户的个人信息生成高质量、个性化的内容。'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        maxTokens: 1000
                    })
                });

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }

                const data = await response.json();
                responseDiv.textContent = data.content;
            } catch (error) {
                responseDiv.textContent = '错误：' + error.message;
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = '生成内容';
            }
        }
    </script>
</body>
</html>`
    },
    {
      title: '代码生成助手',
      description: '使用 AI 生成代码片段',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 代码生成助手</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
        }
        .controls {
            margin-bottom: 20px;
        }
        select, input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            margin-right: 10px;
        }
        textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 10px;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #2563eb;
        }
        button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            position: relative;
        }
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #475569;
            padding: 5px 10px;
            font-size: 12px;
        }
        .copy-btn:hover {
            background: #64748b;
        }
    </style>
</head>
<body>
    <h1>AI 代码生成助手</h1>

    <div class="controls">
        <label>编程语言：</label>
        <select id="language">
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="Go">Go</option>
            <option value="Rust">Rust</option>
            <option value="TypeScript">TypeScript</option>
        </select>
    </div>

    <label>描述你需要的代码功能：</label>
    <textarea id="description" placeholder="例如：创建一个函数，计算数组中所有数字的平均值"></textarea>

    <button onclick="generateCode()">生成代码</button>

    <div id="result" style="display: none; margin-top: 20px;">
        <h2>生成的代码：</h2>
        <pre id="codeOutput"><button class="copy-btn" onclick="copyCode()">复制</button><code id="code"></code></pre>
    </div>

    <script>
        async function generateCode() {
            const description = document.getElementById('description').value;
            const language = document.getElementById('language').value;
            const result = document.getElementById('result');
            const codeElement = document.getElementById('code');

            if (!description.trim()) {
                alert('请描述你需要的代码功能');
                return;
            }

            result.style.display = 'block';
            codeElement.textContent = '正在生成代码...';

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
                                content: \`你是一个专业的编程助手。请根据用户的描述生成\${language}代码。只返回代码，不要添加额外的解释。代码应该清晰、高效、遵循最佳实践。\`
                            },
                            {
                                role: 'user',
                                content: description
                            }
                        ],
                        temperature: 0.5,
                        maxTokens: 2000
                    })
                });

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }

                const data = await response.json();
                codeElement.textContent = data.content;
            } catch (error) {
                codeElement.textContent = '错误：' + error.message;
            }
        }

        function copyCode() {
            const code = document.getElementById('code').textContent;
            navigator.clipboard.writeText(code);
            alert('代码已复制到剪贴板');
        }
    </script>
</body>
</html>`
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">前端 HTML 调用示例</h1>
          <p className="text-gray-600">
            以下是在纯 HTML 页面中调用 AI 接口的完整示例代码，可以直接复制使用
          </p>
        </div>

        {/* URL 配置指南 - 最重要的部分 */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-900 flex items-center gap-2">
            <span className="text-3xl">🔗</span>
            第一步：确定你的 API 地址
          </h2>
          <p className="text-gray-700 mb-4">
            <strong className="text-red-600">这是最关键的一步！</strong>根据你的部署方式，API 地址会有所不同。请根据下面的场景选择正确的配置：
          </p>

          <div className="space-y-4">
            {/* 场景 A：工具平台内调用（最推荐） */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">推荐</span>
                场景 A：在工具平台内调用（同域名）
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                <strong>适用情况：</strong>你的 HTML 代码作为"小工具"嵌入到本平台中（例如：<code className="bg-gray-100 px-2 py-1 rounded">/tools/ai-assistant</code>）
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-semibold text-gray-800 mb-2">✅ 使用相对路径（最简单）：</p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// 直接使用相对路径，无需配置域名
const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        messages: [
            { role: 'system', content: '你是一个helpful助手' },
            { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        maxTokens: 2000
    })
});

const data = await response.json();
console.log(data.content); // AI 的回复`}
                </pre>
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p><strong>优势：</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>✅ 无需配置域名，代码最简洁</li>
                    <li>✅ 无 CORS 跨域问题</li>
                    <li>✅ 自动继承用户认证状态</li>
                    <li>✅ 最稳定可靠的方式</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 场景 B：本地开发测试 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-900 mb-2">场景 B：本地开发测试</h3>
              <p className="text-sm text-gray-700 mb-3">
                <strong>适用情况：</strong>你在本地电脑上开发 HTML 文件，通过 <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8000</code> 访问
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-semibold text-gray-800 mb-2">📝 配置步骤：</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">1. 确定平台服务器地址（根据实际情况选择）：</p>
                    <ul className="text-sm text-gray-600 ml-4 space-y-1">
                      <li>• 本地开发：<code className="bg-gray-200 px-2 py-1 rounded">http://localhost:3000</code></li>
                      <li>• 生产环境：<code className="bg-gray-200 px-2 py-1 rounded">https://your-domain.com</code></li>
                      <li>• 反向代理：<code className="bg-gray-200 px-2 py-1 rounded">https://api.your-domain.com</code></li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">2. 使用完整 URL：</p>
                    <pre className="bg-gray-900 text-blue-400 p-3 rounded text-sm overflow-x-auto">
{`// 方式 1：直接写死 URL（简单但不灵活）
const API_BASE = 'http://localhost:3000';
const response = await fetch(\`\${API_BASE}/api/ai/chat\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 重要：携带 Cookie
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
    })
});

// 方式 2：根据环境自动判断（推荐）
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'  // 本地开发
    : 'https://your-domain.com'; // 生产环境

const response = await fetch(\`\${API_BASE}/api/ai/chat\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
    })
});`}
                    </pre>
                  </div>
                </div>
                <div className="mt-3 text-sm text-red-700 bg-red-50 p-2 rounded">
                  <p><strong>⚠️ 注意：</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>必须通过 HTTP 服务器访问（不能直接双击打开 HTML 文件）</li>
                    <li>推荐使用 VS Code 的 Live Server 插件</li>
                    <li>或运行：<code className="bg-red-100 px-2 py-1 rounded">python -m http.server 8000</code></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 场景 C：域名反向代理 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
              <h3 className="font-bold text-purple-900 mb-2">场景 C：使用域名反向代理</h3>
              <p className="text-sm text-gray-700 mb-3">
                <strong>适用情况：</strong>你使用 Nginx/Caddy 等反向代理，将 API 映射到子域名或子路径
              </p>
              <div className="bg-gray-50 p-3 rounded space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">示例 1：子域名代理</p>
                  <div className="text-sm text-gray-700 mb-2">
                    <p>Nginx 配置：<code className="bg-gray-200 px-2 py-1 rounded">api.your-domain.com</code> → <code className="bg-gray-200 px-2 py-1 rounded">localhost:3000</code></p>
                  </div>
                  <pre className="bg-gray-900 text-purple-400 p-3 rounded text-sm overflow-x-auto">
{`// 使用子域名
const response = await fetch('https://api.your-domain.com/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
    })
});`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">示例 2：子路径代理</p>
                  <div className="text-sm text-gray-700 mb-2">
                    <p>Nginx 配置：<code className="bg-gray-200 px-2 py-1 rounded">your-domain.com/api</code> → <code className="bg-gray-200 px-2 py-1 rounded">localhost:3000/api</code></p>
                  </div>
                  <pre className="bg-gray-900 text-purple-400 p-3 rounded text-sm overflow-x-auto">
{`// 使用子路径
const response = await fetch('https://your-domain.com/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
    })
});`}
                  </pre>
                </div>
              </div>
            </div>

            {/* 场景 D：跨域调用 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
              <h3 className="font-bold text-orange-900 mb-2">场景 D：跨域调用（不推荐）</h3>
              <p className="text-sm text-gray-700 mb-3">
                <strong>适用情况：</strong>从完全不同的域名调用 API（例如：从 <code className="bg-gray-100 px-2 py-1 rounded">example.com</code> 调用 <code className="bg-gray-100 px-2 py-1 rounded">your-platform.com</code> 的 API）
              </p>
              <div className="bg-orange-50 p-3 rounded">
                <p className="text-sm font-semibold text-orange-800 mb-2">⚠️ 需要额外配置：</p>
                <ul className="text-sm text-orange-700 list-disc list-inside ml-4 space-y-1 mb-3">
                  <li>服务器必须配置 CORS 允许跨域</li>
                  <li>可能需要 API Key 认证（Cookie 可能无法跨域传递）</li>
                  <li>安全风险较高，不推荐用于生产环境</li>
                </ul>
                <pre className="bg-gray-900 text-orange-400 p-3 rounded text-sm overflow-x-auto">
{`// 跨域调用示例
const response = await fetch('https://your-platform.com/api/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // 如果需要 API Key 认证
        // 'Authorization': 'Bearer YOUR_API_KEY'
    },
    credentials: 'include', // 尝试携带 Cookie
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
    })
});`}
                </pre>
              </div>
            </div>
          </div>

          {/* 快速决策表 */}
          <div className="mt-6 bg-white rounded-lg p-4 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">🎯 快速决策：我应该用哪种方式？</h3>
            <table className="w-full text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 text-left">你的情况</th>
                  <th className="px-4 py-2 text-left">推荐方案</th>
                  <th className="px-4 py-2 text-left">API 地址</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="bg-green-50">
                  <td className="px-4 py-2">在平台内创建小工具</td>
                  <td className="px-4 py-2 font-semibold text-green-700">场景 A（最推荐）</td>
                  <td className="px-4 py-2"><code className="bg-gray-200 px-2 py-1 rounded">/api/ai/chat</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-2">本地开发测试</td>
                  <td className="px-4 py-2 font-semibold text-blue-700">场景 B</td>
                  <td className="px-4 py-2"><code className="bg-gray-200 px-2 py-1 rounded">http://localhost:3000/api/ai/chat</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-2">生产环境（有域名）</td>
                  <td className="px-4 py-2 font-semibold text-blue-700">场景 B 或 C</td>
                  <td className="px-4 py-2"><code className="bg-gray-200 px-2 py-1 rounded">https://your-domain.com/api/ai/chat</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-2">使用了 Nginx 反向代理</td>
                  <td className="px-4 py-2 font-semibold text-purple-700">场景 C</td>
                  <td className="px-4 py-2"><code className="bg-gray-200 px-2 py-1 rounded">https://api.your-domain.com/api/ai/chat</code></td>
                </tr>
                <tr className="bg-orange-50">
                  <td className="px-4 py-2">从其他网站调用</td>
                  <td className="px-4 py-2 font-semibold text-orange-700">场景 D（不推荐）</td>
                  <td className="px-4 py-2"><code className="bg-gray-200 px-2 py-1 rounded">https://your-platform.com/api/ai/chat</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          {examples.map((example, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    {example.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm whitespace-nowrap"
                  >
                    {expandedIndex === index ? '收起代码' : '展开代码'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(example.code, index)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制代码
                      </>
                    )}
                  </button>
                </div>
              </div>

              {expandedIndex === index && (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-4">
                  <code>{example.code}</code>
                </pre>
              )}
            </div>
          ))}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">使用说明</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>1. 复制上面的任意示例代码</p>
            <p>2. 创建一个新的 HTML 文件（例如 <code className="bg-blue-100 px-2 py-1 rounded">ai-demo.html</code>）</p>
            <p>3. 将代码粘贴到文件中并保存</p>
            <p>4. 在浏览器中打开该文件即可使用</p>
            <p>5. 确保已在 AI 配置中设置了默认模型</p>
          </div>
        </div>

        {/* API 参数说明 */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">API 参数说明</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">参数</th>
                  <th className="px-4 py-2 text-left">类型</th>
                  <th className="px-4 py-2 text-left">必填</th>
                  <th className="px-4 py-2 text-left">说明</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-2"><code>messages</code></td>
                  <td className="px-4 py-2">Array</td>
                  <td className="px-4 py-2">是</td>
                  <td className="px-4 py-2">对话消息数组，每个消息包含 role 和 content</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><code>temperature</code></td>
                  <td className="px-4 py-2">Number</td>
                  <td className="px-4 py-2">否</td>
                  <td className="px-4 py-2">控制输出的随机性，范围 0-1，默认 0.7</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><code>maxTokens</code></td>
                  <td className="px-4 py-2">Number</td>
                  <td className="px-4 py-2">否</td>
                  <td className="px-4 py-2">最大输出长度，默认由模型决定</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><code>providerId</code></td>
                  <td className="px-4 py-2">Number</td>
                  <td className="px-4 py-2">否</td>
                  <td className="px-4 py-2">指定使用的提供商 ID</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><code>modelId</code></td>
                  <td className="px-4 py-2">String</td>
                  <td className="px-4 py-2">否</td>
                  <td className="px-4 py-2">指定使用的模型 ID</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 多场景调用指南 */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">多场景调用指南</h3>

          <div className="space-y-6">
            {/* 场景1：独立HTML页面 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-blue-900 mb-2">场景 1：独立 HTML 页面（本地文件）</h4>
              <p className="text-sm text-gray-700 mb-3">
                当你创建一个独立的 HTML 文件并在浏览器中直接打开时（file:// 协议）
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium text-red-600">⚠️ 注意事项：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>必须通过 HTTP 服务器访问，不能直接打开 HTML 文件</li>
                  <li>推荐使用 VS Code 的 Live Server 插件或 Python 的 SimpleHTTPServer</li>
                  <li>API 路径必须使用完整的域名：<code className="bg-gray-200 px-2 py-1 rounded">http://localhost:3000/api/ai/chat</code></li>
                  <li>需要处理 CORS 跨域问题（如果域名不同）</li>
                </ul>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded mt-3 overflow-x-auto">
{`// 正确的调用方式
const response = await fetch('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include', // 重要：携带 Cookie
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
    })
});`}
                </pre>
              </div>
            </div>

            {/* 场景2：集成到工具平台 */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-900 mb-2">场景 2：集成到工具平台（同域名）</h4>
              <p className="text-sm text-gray-700 mb-3">
                当你的 HTML 代码作为工具嵌入到平台中时（例如 /tools/ai-chat）
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium text-green-600">✅ 优势：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>无需处理 CORS 问题（同域名）</li>
                  <li>可以使用相对路径：<code className="bg-gray-200 px-2 py-1 rounded">/api/ai/chat</code></li>
                  <li>自动携带认证信息</li>
                  <li>最推荐的方式</li>
                </ul>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded mt-3 overflow-x-auto">
{`// 推荐的调用方式（相对路径）
const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
    })
});`}
                </pre>
              </div>
            </div>

            {/* 场景3：第三方网站调用 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-purple-900 mb-2">场景 3：第三方网站调用（跨域）</h4>
              <p className="text-sm text-gray-700 mb-3">
                当你从其他域名的网站调用 API 时
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium text-purple-600">🔧 需要配置：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>服务器需要配置 CORS 允许跨域访问</li>
                  <li>必须使用完整的 URL</li>
                  <li>可能需要 API Key 认证（而不是 Cookie）</li>
                  <li>注意安全性，不要暴露敏感信息</li>
                </ul>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded mt-3 overflow-x-auto">
{`// 跨域调用示例
const response = await fetch('https://your-domain.com/api/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // 如果需要 API Key 认证
        // 'Authorization': 'Bearer YOUR_API_KEY'
    },
    credentials: 'include', // 尝试携带 Cookie
    body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
    })
});`}
                </pre>
              </div>
            </div>

            {/* 场景4：React/Vue等框架 */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-orange-900 mb-2">场景 4：React/Vue/Angular 等框架</h4>
              <p className="text-sm text-gray-700 mb-3">
                在现代前端框架中使用 AI 接口
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium text-orange-600">💡 最佳实践：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>创建独立的 API 服务模块</li>
                  <li>使用 axios 或 fetch 封装</li>
                  <li>统一处理错误和加载状态</li>
                  <li>考虑使用状态管理（Redux/Vuex）</li>
                </ul>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded mt-3 overflow-x-auto">
{`// React 示例
import { useState } from 'react';

function AIChat() {
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const callAI = async (message) => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }]
                })
            });
            const data = await res.json();
            setResponse(data.content);
        } catch (error) {
            console.error('AI 调用失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={() => callAI('你好')} disabled={loading}>
                {loading ? '处理中...' : '发送'}
            </button>
            <p>{response}</p>
        </div>
    );
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 重要注意事项 */}
        <div className="mt-8 bg-red-50 rounded-lg border border-red-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-900">⚠️ 重要注意事项</h3>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-red-800 mb-2">1. 认证问题</h4>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>当前 API 需要管理员认证（已登录管理后台）</li>
                <li>如果要开放给普通用户，需要修改 API 路由的认证逻辑</li>
                <li>建议为不同用户等级设置不同的调用限制</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-800 mb-2">2. 跨域（CORS）问题</h4>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>本地开发时，HTML 文件必须通过 HTTP 服务器访问</li>
                <li>不能直接双击打开 HTML 文件（file:// 协议会被浏览器阻止）</li>
                <li>推荐使用 VS Code 的 Live Server 插件</li>
                <li>或使用命令：<code className="bg-red-100 px-2 py-1 rounded">python -m http.server 8000</code></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-800 mb-2">3. 错误处理</h4>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>始终使用 try-catch 包裹 API 调用</li>
                <li>检查 response.ok 状态</li>
                <li>为用户提供友好的错误提示</li>
                <li>记录错误日志便于调试</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-800 mb-2">4. 性能优化</h4>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>避免频繁调用 API（添加防抖/节流）</li>
                <li>合理设置 maxTokens 控制输出长度</li>
                <li>显示加载状态，提升用户体验</li>
                <li>考虑缓存常见问题的答案</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-800 mb-2">5. 安全性</h4>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>不要在前端代码中硬编码 API Key</li>
                <li>验证和清理用户输入</li>
                <li>设置合理的速率限制</li>
                <li>监控 API 使用量，防止滥用</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-800 mb-2">6. Temperature 参数选择</h4>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li><strong>0.1-0.3</strong>：适合翻译、代码生成等需要精确输出的场景</li>
                <li><strong>0.5-0.7</strong>：适合一般对话、问答等场景（推荐默认值）</li>
                <li><strong>0.8-1.0</strong>：适合创意写作、头脑风暴等需要多样性的场景</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 调试技巧 */}
        <div className="mt-8 bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-900">🔍 调试技巧</h3>

          <div className="space-y-3 text-sm text-yellow-800">
            <div>
              <h4 className="font-semibold mb-1">1. 使用浏览器开发者工具</h4>
              <p>按 F12 打开开发者工具，查看 Network 标签页中的 API 请求和响应</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">2. 添加详细的日志</h4>
              <pre className="bg-yellow-100 p-3 rounded mt-2 overflow-x-auto text-xs">
{`console.log('发送请求:', requestBody);
console.log('收到响应:', responseData);
console.error('发生错误:', error);`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-1">3. 测试 API 连接</h4>
              <p>先在管理后台的"全局默认模型"中测试连接，确保 API 配置正确</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">4. 检查认证状态</h4>
              <p>确保已登录管理后台，或者修改 API 路由移除认证要求</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">5. 使用 Postman 测试</h4>
              <p>可以使用 Postman 等工具直接测试 API 接口，排除前端代码问题</p>
            </div>
          </div>
        </div>

        {/* 常见问题 */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">❓ 常见问题</h3>

          <div className="space-y-4">
            <div className="border-b pb-3">
              <h4 className="font-semibold text-gray-900 mb-2">Q: 为什么我的 HTML 文件无法调用 API？</h4>
              <p className="text-sm text-gray-700">
                A: 不能直接双击打开 HTML 文件。必须通过 HTTP 服务器访问，推荐使用 VS Code 的 Live Server 插件，
                或运行 <code className="bg-gray-100 px-2 py-1 rounded">python -m http.server 8000</code>
              </p>
            </div>

            <div className="border-b pb-3">
              <h4 className="font-semibold text-gray-900 mb-2">Q: 收到 401 Unauthorized 错误怎么办？</h4>
              <p className="text-sm text-gray-700">
                A: 当前 API 需要管理员认证。请先登录管理后台，或者修改 <code className="bg-gray-100 px-2 py-1 rounded">/api/ai/chat/route.ts</code>
                移除 <code className="bg-gray-100 px-2 py-1 rounded">requireAuth()</code> 调用。
              </p>
            </div>

            <div className="border-b pb-3">
              <h4 className="font-semibold text-gray-900 mb-2">Q: 如何指定使用特定的 AI 模型？</h4>
              <p className="text-sm text-gray-700">
                A: 在请求中添加 <code className="bg-gray-100 px-2 py-1 rounded">providerId</code> 和
                <code className="bg-gray-100 px-2 py-1 rounded">modelId</code> 参数。可以在管理后台查看可用的提供商和模型 ID。
              </p>
            </div>

            <div className="border-b pb-3">
              <h4 className="font-semibold text-gray-900 mb-2">Q: 如何控制 AI 的输出长度？</h4>
              <p className="text-sm text-gray-700">
                A: 使用 <code className="bg-gray-100 px-2 py-1 rounded">maxTokens</code> 参数。例如：
                <code className="bg-gray-100 px-2 py-1 rounded">maxTokens: 500</code> 限制输出约 500 个 token（约 300-400 个中文字）。
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Q: 如何实现流式输出（打字机效果）？</h4>
              <p className="text-sm text-gray-700">
                A: 当前版本暂不支持流式输出。如需此功能，需要修改后端 API 支持 Server-Sent Events (SSE) 或 WebSocket。
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
