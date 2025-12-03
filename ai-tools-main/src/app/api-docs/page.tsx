'use client'

import { useState } from 'react'
import { Copy, Check, Code, BookOpen, Zap } from 'lucide-react'

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

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

  const completeExampleCode = `<!DOCTYPE html>
<html>
<head>
  <title>My Tool</title>
</head>
<body>
  <h1>My Awesome Tool</h1>
  <button id="submitBtn">Submit</button>

  <script>
    // Get tool ID from URL or set it manually
    const TOOL_ID = 1; // Replace with your tool ID

    ${fingerprintCode}

    ${checkUsageCode}

    ${recordUsageCode}

    // Usage example
    document.getElementById('submitBtn').addEventListener('click', async function() {
      // Check if user can use the tool
      const canUse = await checkUsage(TOOL_ID);
      if (!canUse) return;

      // Your tool logic here
      console.log('Processing...');

      // Record the usage
      await recordUsage(TOOL_ID);

      console.log('Done!');
    });
  </script>
</body>
</html>`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-gray-600 mt-1">Usage Tracking & Limits Integration Guide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 1: Generate Browser Fingerprint</h3>
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

            {/* Step 2 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 2: Check Usage Before Action</h3>
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

            {/* Step 3 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 3: Record Usage After Action</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Complete Example</h3>
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
                    <td className="px-4 py-3 text-sm text-gray-600">10 uses</td>
                    <td className="px-4 py-3 text-sm text-gray-600">30 days (configurable)</td>
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
              * Guest limits can be configured in the admin settings panel
            </p>
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
                  <p className="font-semibold text-gray-900">Check before action</p>
                  <p className="text-gray-600 text-sm">Always call <code className="bg-gray-100 px-1 rounded">/api/usage/check</code> before performing the tool action to prevent wasted operations.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Record after success</p>
                  <p className="text-gray-600 text-sm">Only call <code className="bg-gray-100 px-1 rounded">/api/usage/record</code> after the tool action completes successfully.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Show remaining uses</p>
                  <p className="text-gray-600 text-sm">Display remaining uses to users when they're running low (e.g., less than 5 remaining).</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
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
    </div>
  )
}
