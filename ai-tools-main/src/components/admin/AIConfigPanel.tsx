'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  RefreshCw,
  TestTube,
  Star,
  Power,
} from 'lucide-react';

interface AIModel {
  id: number;
  modelId: string;
  displayName: string;
  enabled: boolean;
  isDefault: boolean;
}

interface AIProvider {
  id: number;
  name: string;
  type: string;
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  isDefault: boolean;
  hasApiKey: boolean;
  models: AIModel[];
}

interface AIConfigPanelProps {
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function AIConfigPanel({ showToast }: AIConfigPanelProps) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingProvider, setTestingProvider] = useState<number | null>(null);
  const [fetchingModels, setFetchingModels] = useState<number | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: 'openai',
    apiKey: '',
    baseUrl: '',
    enabled: true,
  });

  // 加载提供商列表
  const loadProviders = async () => {
    try {
      const response = await fetch('/api/ai-providers', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load providers');
      const data = await response.json();
      setProviders(data);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'openai',
      apiKey: '',
      baseUrl: '',
      enabled: true,
    });
    setEditingProvider(null);
    setShowAddForm(false);
  };

  // 添加提供商
  const handleAdd = async () => {
    try {
      const response = await fetch('/api/ai-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add provider');
      }

      showToast('提供商添加成功', 'success');
      resetForm();
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 更新提供商
  const handleUpdate = async () => {
    if (!editingProvider) return;

    try {
      const response = await fetch('/api/ai-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: editingProvider.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update provider');
      }

      showToast('提供商更新成功', 'success');
      resetForm();
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 删除提供商
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个提供商吗？')) return;

    try {
      const response = await fetch(`/api/ai-providers?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete provider');

      showToast('提供商删除成功', 'success');
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 测试连接
  const handleTest = async (id: number) => {
    setTestingProvider(id);
    try {
      const response = await fetch(`/api/ai-providers/${id}/test`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        showToast('连接测试成功', 'success');
      } else {
        showToast(`连接测试失败: ${result.message}`, 'error');
      }
    } catch (error: any) {
      showToast('连接测试失败', 'error');
    } finally {
      setTestingProvider(null);
    }
  };

  // 获取模型列表
  const handleFetchModels = async (id: number) => {
    setFetchingModels(id);
    try {
      const response = await fetch(`/api/ai-providers/${id}/models`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch models');
      }

      const models = await response.json();

      // 保存模型到数据库
      const saveResponse = await fetch(`/api/ai-providers/${id}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          models: models.map((m: any) => ({
            id: m.id,
            name: m.name,
            enabled: true,
          })),
        }),
      });

      if (!saveResponse.ok) throw new Error('Failed to save models');

      showToast(`成功获取 ${models.length} 个模型`, 'success');
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setFetchingModels(null);
    }
  };

  // 编辑提供商
  const startEdit = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      apiKey: '***',
      baseUrl: provider.baseUrl || '',
      enabled: provider.enabled,
    });
    setShowAddForm(true);
  };

  // 切换启用状态
  const toggleEnabled = async (provider: AIProvider) => {
    try {
      const response = await fetch('/api/ai-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: provider.id,
          name: provider.name,
          type: provider.type,
          apiKey: '***',
          baseUrl: provider.baseUrl,
          enabled: !provider.enabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle provider');

      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };


  const providerTypes = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'claude', label: 'Anthropic Claude' },
    { value: 'zhipu', label: '智谱AI' },
    { value: 'openai-compatible', label: 'OpenAI 兼容接口' },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">AI 模型配置</h2>
          <p className="text-sm text-gray-600 mt-1">
            管理 AI 提供商和模型配置
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          添加提供商
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProvider ? '编辑提供商' : '添加提供商'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="例如: My OpenAI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {providerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={editingProvider ? '留空则不修改' : '输入 API Key'}
              />
            </div>

            {(formData.type === 'openai-compatible' || formData.baseUrl) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Base URL {formData.type === 'openai-compatible' && '(必填)'}
                </label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://api.example.com/v1"
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, enabled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">启用</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={editingProvider ? handleUpdate : handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              {editingProvider ? '更新' : '添加'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* 提供商列表 */}
      <div className="space-y-4">
        {providers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">还没有配置任何 AI 提供商</p>
          </div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        provider.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {provider.enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    类型: {providerTypes.find((t) => t.value === provider.type)?.label}
                  </p>
                  {provider.baseUrl && (
                    <p className="text-sm text-gray-600 mt-1">
                      Base URL: {provider.baseUrl}
                    </p>
                  )}

                  {/* 模型列表 */}
                  {provider.models.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        已配置模型 ({provider.models.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {provider.models.map((model) => (
                          <span
                            key={model.id}
                            className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                          >
                            {model.displayName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleTest(provider.id)}
                    disabled={testingProvider === provider.id}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {testingProvider === provider.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    测试
                  </button>

                  <button
                    onClick={() => handleFetchModels(provider.id)}
                    disabled={fetchingModels === provider.id}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {fetchingModels === provider.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    获取模型
                  </button>

                  <button
                    onClick={() => toggleEnabled(provider)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm whitespace-nowrap font-medium ${
                      provider.enabled
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {provider.enabled ? '禁用' : '启用'}
                  </button>

                  <button
                    onClick={() => startEdit(provider)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>

                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 全局默认模型选择器 */}
      {providers.some(p => p.models.length > 0) && (
        <GlobalDefaultModelSelector
          providers={providers}
          showToast={showToast}
          onModelChange={loadProviders}
        />
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">使用说明</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>1. 添加 AI 提供商并配置 API Key</p>
          <p>2. 点击"测试"按钮验证连接是否正常</p>
          <p>3. 点击"获取模型"按钮自动获取可用模型列表</p>
          <p>4. 在"全局默认模型"中选择一个默认模型</p>
          <p>5. 前端可通过 <code className="bg-blue-100 px-2 py-1 rounded">/api/ai/chat</code> 接口调用 AI 服务</p>
          <p>6. 查看"前端调用示例"了解如何在 HTML 页面中使用</p>
        </div>
      </div>
    </div>
  );
}

// 全局默认模型和备用模型选择器组件
function GlobalDefaultModelSelector({
  providers,
  showToast,
  onModelChange
}: {
  providers: AIProvider[];
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  onModelChange: () => void;
}) {
  const [defaultModelId, setDefaultModelId] = useState<number | null>(null);
  const [backupModelId1, setBackupModelId1] = useState<number | null>(null);
  const [backupModelId2, setBackupModelId2] = useState<number | null>(null);
  const [backupModelId3, setBackupModelId3] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string }>>({});

  // 获取所有可用模型
  const allModels = providers.flatMap(provider =>
    provider.models
      .filter(m => m.enabled && provider.enabled)
      .map(model => ({
        ...model,
        providerName: provider.name,
        providerType: provider.type,
      }))
  );

  // 加载当前默认模型和备用模型
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch('/api/ai/default-model', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();

          // 获取所有当前可用的模型 ID
          const availableModelIds = allModels.map(m => m.id);

          // 只设置存在的模型 ID，不存在的设为 null
          setDefaultModelId(
            data.defaultModelId && availableModelIds.includes(data.defaultModelId)
              ? data.defaultModelId
              : null
          );
          setBackupModelId1(
            data.backupModelId1 && availableModelIds.includes(data.backupModelId1)
              ? data.backupModelId1
              : null
          );
          setBackupModelId2(
            data.backupModelId2 && availableModelIds.includes(data.backupModelId2)
              ? data.backupModelId2
              : null
          );
          setBackupModelId3(
            data.backupModelId3 && availableModelIds.includes(data.backupModelId3)
              ? data.backupModelId3
              : null
          );
        }
      } catch (error) {
        // 静默处理错误
      } finally {
        setLoading(false);
      }
    };
    loadModels();
  }, [providers, allModels]);

  // 设置默认模型
  const handleSetDefaultModel = async (modelId: number) => {
    try {
      const response = await fetch('/api/ai/default-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          defaultModelId: modelId,
          backupModelId1: backupModelId1 || undefined,
          backupModelId2: backupModelId2 || undefined,
          backupModelId3: backupModelId3 || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to set default model');
      }

      setDefaultModelId(modelId);
      showToast('全局默认模型设置成功', 'success');
      onModelChange();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 设置备用模型
  const handleSetBackupModel = async (backupNumber: 1 | 2 | 3, modelId: number | null) => {
    try {
      // 检查是否已设置默认模型
      if (!defaultModelId) {
        showToast('请先设置默认模型', 'warning');
        return;
      }

      const updates: any = {
        defaultModelId,
        backupModelId1: backupModelId1 || undefined,
        backupModelId2: backupModelId2 || undefined,
        backupModelId3: backupModelId3 || undefined
      };
      updates[`backupModelId${backupNumber}`] = modelId || undefined;

      const response = await fetch('/api/ai/default-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to set backup model');
      }

      if (backupNumber === 1) setBackupModelId1(modelId);
      if (backupNumber === 2) setBackupModelId2(modelId);
      if (backupNumber === 3) setBackupModelId3(modelId);

      showToast(`全局备用模型${backupNumber}设置成功`, 'success');
      onModelChange();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 测试单个模型
  const testSingleModel = async (modelId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const model = allModels.find(m => m.id === modelId);
      if (!model) {
        return { success: false, message: '模型不存在' };
      }

      // 找到该模型对应的提供商
      const provider = providers.find(p => p.models.some(m => m.id === modelId));
      if (!provider) {
        return { success: false, message: '提供商不存在' };
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          providerId: provider.id,  // 指定提供商 ID
          modelId: model.modelId,   // 指定模型 ID
          messages: [
            {
              role: 'user',
              content: '请回复"测试成功"'
            }
          ],
          temperature: 0.1,
          maxTokens: 200  // 增加到 200，避免某些模型的长度限制问题
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();

      // 检查响应格式
      if (data && typeof data === 'object') {
        if (data.content && data.content.trim().length > 0) {
          return { success: true, message: '连接成功' };
        } else if (data.error) {
          return { success: false, message: data.error };
        } else if (data.content === '') {
          return { success: false, message: '模型返回空内容' };
        } else {
          return { success: false, message: `响应格式异常: ${JSON.stringify(data)}` };
        }
      } else {
        return { success: false, message: '响应不是有效的JSON对象' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || '连接失败' };
    }
  };

  // 测试所有配置的模型
  const handleTestAllModels = async () => {
    if (!defaultModelId) {
      showToast('请先选择默认模型', 'warning');
      return;
    }

    setTesting(true);
    setTestResults({});

    const modelsToTest = [
      { id: defaultModelId, name: '默认模型' },
      { id: backupModelId1, name: '备用模型1' },
      { id: backupModelId2, name: '备用模型2' },
      { id: backupModelId3, name: '备用模型3' },
    ].filter(m => m.id !== null) as { id: number; name: string }[];

    let successCount = 0;
    let failCount = 0;

    for (const { id, name } of modelsToTest) {
      const result = await testSingleModel(id);
      setTestResults(prev => ({ ...prev, [id]: result }));

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setTesting(false);

    if (failCount === 0) {
      showToast(`✅ 所有模型测试成功！(${successCount}/${modelsToTest.length})`, 'success');
    } else if (successCount === 0) {
      showToast(`❌ 所有模型测试失败！(0/${modelsToTest.length})`, 'error');
    } else {
      showToast(`⚠️ 部分模型测试失败 (成功: ${successCount}, 失败: ${failCount})`, 'warning');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">全局默认模型与备用模型</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        选择一个默认模型和最多3个备用模型。当默认模型调用失败时，系统会自动按顺序尝试备用模型。
      </p>

      <div className="space-y-4">
        {allModels.length === 0 ? (
          <p className="text-sm text-gray-600">
            暂无可用模型，请先添加提供商并获取模型列表
          </p>
        ) : (
          <>
            {/* 默认模型 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-red-500">*</span> 全局默认模型
              </label>
              <select
                value={defaultModelId || ''}
                onChange={(e) => handleSetDefaultModel(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">请选择默认模型</option>
                {allModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.providerName} - {model.displayName}
                  </option>
                ))}
              </select>
              {defaultModelId && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✓ 当前默认模型：
                    {allModels.find(m => m.id === defaultModelId)?.providerName} -
                    {allModels.find(m => m.id === defaultModelId)?.displayName}
                  </p>
                  {testResults[defaultModelId] && (
                    <p className={`text-sm mt-1 ${testResults[defaultModelId].success ? 'text-green-700' : 'text-red-700'}`}>
                      {testResults[defaultModelId].success ? '✅' : '❌'} 测试结果: {testResults[defaultModelId].message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 备用模型1 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                全局备用模型 1（可选）
              </label>
              <select
                value={backupModelId1 || ''}
                onChange={(e) => handleSetBackupModel(1, e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">不设置备用模型1</option>
                {allModels
                  .filter(m => m.id !== defaultModelId)
                  .map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.providerName} - {model.displayName}
                    </option>
                  ))}
              </select>
              {backupModelId1 && testResults[backupModelId1] && (
                <div className={`mt-2 p-2 rounded-lg ${testResults[backupModelId1].success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm ${testResults[backupModelId1].success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResults[backupModelId1].success ? '✅' : '❌'} {testResults[backupModelId1].message}
                  </p>
                </div>
              )}
            </div>

            {/* 备用模型2 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                全局备用模型 2（可选）
              </label>
              <select
                value={backupModelId2 || ''}
                onChange={(e) => handleSetBackupModel(2, e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">不设置备用模型2</option>
                {allModels
                  .filter(m => m.id !== defaultModelId && m.id !== backupModelId1)
                  .map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.providerName} - {model.displayName}
                    </option>
                  ))}
              </select>
              {backupModelId2 && testResults[backupModelId2] && (
                <div className={`mt-2 p-2 rounded-lg ${testResults[backupModelId2].success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm ${testResults[backupModelId2].success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResults[backupModelId2].success ? '✅' : '❌'} {testResults[backupModelId2].message}
                  </p>
                </div>
              )}
            </div>

            {/* 备用模型3 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                全局备用模型 3（可选）
              </label>
              <select
                value={backupModelId3 || ''}
                onChange={(e) => handleSetBackupModel(3, e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">不设置备用模型3</option>
                {allModels
                  .filter(m => m.id !== defaultModelId && m.id !== backupModelId1 && m.id !== backupModelId2)
                  .map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.providerName} - {model.displayName}
                    </option>
                  ))}
              </select>
              {backupModelId3 && testResults[backupModelId3] && (
                <div className={`mt-2 p-2 rounded-lg ${testResults[backupModelId3].success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm ${testResults[backupModelId3].success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResults[backupModelId3].success ? '✅' : '❌'} {testResults[backupModelId3].message}
                  </p>
                </div>
              )}
            </div>

            {/* 测试按钮 */}
            {defaultModelId && (
              <button
                onClick={handleTestAllModels}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    正在测试所有模型...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    测试所有配置的模型
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
