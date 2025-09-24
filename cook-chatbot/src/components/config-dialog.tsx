'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useChatConfig, type ChatConfig } from '@/hooks/use-chat-config'
import { needsCorsProxy } from '@/lib/api-proxy'

interface ConfigDialogProps {
  onConfigSaved?: () => void
}

export function ConfigDialog({ onConfigSaved }: ConfigDialogProps) {
  const { config, setConfig, isConfigured } = useChatConfig()
  const [tempConfig, setTempConfig] = useState<ChatConfig>(config)
  const [showConfig, setShowConfig] = useState(!isConfigured)

  // 同步配置变化
  useEffect(() => {
    setTempConfig(config)
  }, [config])

  // 当配置状态改变时更新显示状态
  useEffect(() => {
    if (!isConfigured) {
      setShowConfig(true)
    }
  }, [isConfigured])

  const handleSave = () => {
    setConfig(tempConfig)
    setShowConfig(false)
    onConfigSaved?.()
  }

  const commonConfigs = [
    { name: 'OpenAI', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini', cors: true },
    { name: 'Groq', baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.1-8b-instant', cors: true },
    { name: '豆包', baseURL: 'https://ark.cn-beijing.volces.com/api/v3', model: 'ep-20241224141755-zxxxc', cors: false },
    { name: 'DeepSeek', baseURL: 'https://api.deepseek.com', model: 'deepseek-chat', cors: true },
    { name: 'Ollama', baseURL: 'http://localhost:11434/v1', model: 'llama3.2', cors: true },
  ]

  if (!showConfig && isConfigured) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary">
          {commonConfigs.find(c => c.baseURL === config.baseURL)?.name || 'Custom'}
        </Badge>
        <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
          配置 API
        </Button>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 mb-4 space-y-4">
      <h3 className="text-lg font-semibold">API 配置</h3>

      <div className="flex flex-wrap gap-2">
        {commonConfigs.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            className={`${!preset.cors ? 'border-orange-300 text-orange-600' : ''}`}
            onClick={() => setTempConfig(prev => ({ ...prev, baseURL: preset.baseURL, model: preset.model }))}
            title={!preset.cors ? '此 API 可能存在 CORS 限制' : ''}
          >
            {preset.name}
            {!preset.cors && <span className="ml-1 text-orange-500">⚠</span>}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">API Key</label>
          <Input
            type="password"
            placeholder="sk-..."
            value={tempConfig.apiKey}
            onChange={(e) => setTempConfig(prev => ({ ...prev, apiKey: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Base URL</label>
          <Input
            placeholder="https://api.openai.com/v1"
            value={tempConfig.baseURL}
            onChange={(e) => setTempConfig(prev => ({ ...prev, baseURL: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Model</label>
          <Input
            placeholder="gpt-4o-mini"
            value={tempConfig.model}
            onChange={(e) => setTempConfig(prev => ({ ...prev, model: e.target.value }))}
          />
        </div>
      </div>

      {needsCorsProxy(tempConfig.baseURL) && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <span className="text-orange-500">⚠</span>
            <div className="text-sm text-orange-800">
              <div className="font-medium">CORS 限制警告</div>
              <div className="mt-1">
                此 API 端点可能存在跨域访问限制。如果遇到连接问题，建议使用支持 CORS 的替代 API（如 OpenAI、Groq、DeepSeek）。
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!tempConfig.apiKey}>
          保存配置
        </Button>
        {isConfigured && (
          <Button variant="outline" onClick={() => setShowConfig(false)}>
            取消
          </Button>
        )}
      </div>
    </div>
  )
}