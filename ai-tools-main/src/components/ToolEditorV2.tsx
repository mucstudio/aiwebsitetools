'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Code, Eye, Palette, Settings, FileCode, Save, X, AlertCircle, Smile, Sparkles } from 'lucide-react'
import { ToolRuntime } from '@/lib/toolRuntime'
import { validateToolCode } from '@/lib/toolSandbox'
import EmojiPicker from './EmojiPicker'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] border border-gray-300 rounded-lg bg-gray-50">
      <p className="text-gray-500">Loading editor...</p>
    </div>
  )
})

interface Category {
  id: number
  name: string
  slug: string
}

interface ToolEditorV2Props {
  initialData?: {
    id?: number
    name: string
    description: string
    toolType: string
    componentCode?: string
    styleCode?: string
    configJson?: string
    code?: string
    icon: string
    categoryId: number
    sortOrder: number
    skipSecurityCheck: boolean
  }
  categories: Category[]
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  saving?: boolean
}

type EditorTab = 'component' | 'style' | 'config' | 'preview'

export default function ToolEditorV2({
  initialData,
  categories,
  onSave,
  onCancel,
  saving
}: ToolEditorV2Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>('component')
  const [toolType, setToolType] = useState(initialData?.toolType || 'iframe')

  // Form data
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    icon: initialData?.icon || '🔧',
    categoryId: initialData?.categoryId || (categories[0]?.id || 0),
    sortOrder: initialData?.sortOrder || 0,
    skipSecurityCheck: initialData?.skipSecurityCheck !== undefined ? initialData.skipSecurityCheck : true
  })

  // Code data
  const [componentCode, setComponentCode] = useState(
    initialData?.componentCode || getDefaultComponentTemplate()
  )
  const [styleCode, setStyleCode] = useState(initialData?.styleCode || '')
  const [configJson, setConfigJson] = useState(
    initialData?.configJson || getDefaultConfigTemplate()
  )
  const [iframeCode, setIframeCode] = useState(initialData?.code || '')

  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // AI description generation
  const [generatingDescription, setGeneratingDescription] = useState(false)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const tabs = [
    { id: 'component', label: toolType === 'react' ? 'Component' : 'HTML', icon: FileCode },
    { id: 'style', label: 'Styles', icon: Palette },
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Eye },
  ]

  const handleValidate = () => {
    if (toolType === 'react' && componentCode) {
      const result = validateToolCode(componentCode)
      setValidationErrors(result.errors)
      setValidationWarnings(result.warnings)
      return result.isValid
    }
    return true
  }

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a tool name first')
      return
    }

    const code = toolType === 'react' ? componentCode : iframeCode
    if (!code.trim()) {
      alert('Please enter tool code first')
      return
    }

    setGeneratingDescription(true)

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: formData.name,
          toolCode: code,
          toolType: toolType
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setFormData({ ...formData, description: result.description })
      } else {
        alert(result.error || 'Failed to generate description')
      }
    } catch (error) {
      console.error('Error generating description:', error)
      alert('Failed to generate description. Please check your AI configuration.')
    } finally {
      setGeneratingDescription(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a tool name')
      return
    }

    if (toolType === 'react') {
      if (!componentCode.trim()) {
        alert('Please enter component code')
        return
      }

      if (!formData.skipSecurityCheck) {
        const isValid = handleValidate()
        if (!isValid) {
          const proceed = confirm(
            'Security validation failed. Do you want to continue anyway? (Not recommended)'
          )
          if (!proceed) return
        }
      }
    } else if (toolType === 'iframe') {
      if (!iframeCode.trim()) {
        alert('Please enter HTML code')
        return
      }
    }

    await onSave({
      ...formData,
      toolType,
      componentCode: toolType === 'react' ? componentCode : null,
      styleCode: toolType === 'react' ? styleCode : null,
      configJson: toolType === 'react' ? configJson : null,
      code: toolType === 'iframe' ? iframeCode : '',
      id: initialData?.id
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

        <div className="space-y-4">
          {/* Tool Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="react"
                  checked={toolType === 'react'}
                  onChange={(e) => setToolType(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">React Component (Recommended)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="iframe"
                  checked={toolType === 'iframe'}
                  onChange={(e) => setToolType(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">HTML/iframe (Legacy)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={50}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., JSON Formatter"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingDescription}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3 h-3" />
                {generatingDescription ? 'Generating...' : 'AI Optimize'}
              </button>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Engaging description of what this tool does and why users should try it (3-5 sentences)"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Click "AI Optimize" to generate an engaging paragraph that attracts users to click
              </span>
              <span className="text-xs text-gray-500">
                {formData.description.length} characters
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon (Emoji)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="🔧"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Choose emoji"
                >
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.skipSecurityCheck}
              onChange={(e) => setFormData({ ...formData, skipSecurityCheck: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label className="text-sm text-gray-700">Skip Security Check</label>
          </div>

          {/* Emoji Picker - Full Width */}
          <div className="relative" ref={emojiPickerRef}>
            {showEmojiPicker && (
              <EmojiPicker
                value={formData.icon}
                onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as EditorTab)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Editor Content */}
        <div className="p-6">
          {activeTab === 'component' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {toolType === 'react' ? 'React Component Code' : 'HTML Code'}
                </h3>
                {toolType === 'react' && (
                  <button
                    type="button"
                    onClick={handleValidate}
                    className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    Validate Code
                  </button>
                )}
              </div>

              {/* Validation Messages */}
              {validationErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Validation Errors:</h4>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {validationWarnings.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Warnings:</h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        {validationWarnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <MonacoEditor
                height="600px"
                language={toolType === 'react' ? 'typescript' : 'html'}
                value={toolType === 'react' ? componentCode : iframeCode}
                onChange={(value) => {
                  if (toolType === 'react') {
                    setComponentCode(value || '')
                  } else {
                    setIframeCode(value || '')
                  }
                }}
                theme="vs-light"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </div>
          )}

          {activeTab === 'style' && toolType === 'react' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">CSS Styles</h3>
              <MonacoEditor
                height="600px"
                language="css"
                value={styleCode}
                onChange={(value) => setStyleCode(value || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
          )}

          {activeTab === 'config' && toolType === 'react' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Tool Configuration (JSON)</h3>
              <MonacoEditor
                height="600px"
                language="json"
                value={configJson}
                onChange={(value) => setConfigJson(value || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
          )}

          {activeTab === 'preview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[600px]">
                {toolType === 'react' ? (
                  <ToolRuntime
                    componentCode={componentCode}
                    styleCode={styleCode}
                    configJson={configJson}
                    toolId={initialData?.id || 0}
                    onError={(error) => console.error('Preview error:', error)}
                  />
                ) : (
                  <iframe
                    srcDoc={iframeCode}
                    className="w-full h-full min-h-[600px] border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Tool Preview"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : initialData?.id ? 'Update Tool' : 'Create Tool'}
        </button>
      </div>
    </form>
  )
}

function getDefaultComponentTemplate() {
  return `import React, { useState } from 'react'

export default function ToolComponent() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleProcess = () => {
    // Your tool logic here
    setOutput(input.toUpperCase())
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        My Tool
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            rows={4}
            placeholder="Enter text here..."
          />
        </div>

        <button
          onClick={handleProcess}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Process
        </button>

        {output && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output
            </label>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}`
}

function getDefaultConfigTemplate() {
  return JSON.stringify({
    name: 'My Tool',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Tool description',
    features: [],
    settings: {}
  }, null, 2)
}
