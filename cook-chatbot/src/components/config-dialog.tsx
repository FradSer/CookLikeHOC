'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useChatConfig, type ChatConfig } from '@/hooks/use-chat-config'
import { needsCorsProxy } from '@/lib/api-proxy'

interface ConfigDialogProps {
  onConfigSaved?: () => void
}

export function ConfigDialog({ onConfigSaved }: ConfigDialogProps) {
  const { config, setConfig, isConfigured } = useChatConfig()
  const [tempConfig, setTempConfig] = useState<ChatConfig>(config)
  const [open, setOpen] = useState(!isConfigured)

  // 同步配置变化
  useEffect(() => {
    setTempConfig(config)
  }, [config])

  // 当配置状态改变时更新显示状态
  useEffect(() => {
    if (!isConfigured) {
      setOpen(true)
    }
  }, [isConfigured])

  const handleSave = () => {
    setConfig(tempConfig)
    setOpen(false)
    onConfigSaved?.()
  }

  const commonConfigs = [
    { name: 'OpenAI', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini', cors: true },
    { name: 'Groq', baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.1-8b-instant', cors: true },
    { name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat', cors: true },
    { name: 'Ollama', baseURL: 'http://localhost:11434/v1', model: 'llama3.2', cors: true },
  ]

  if (isConfigured) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              {commonConfigs.find(c => c.baseURL === config.baseURL)?.name || 'Custom'}
            </Badge>
            <Button variant="outline" size="sm">
              配置 API
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API 配置</DialogTitle>
            <DialogDescription>
              配置您的 AI API 接口信息，支持 OpenAI、Groq、DeepSeek 等多种服务商。
            </DialogDescription>
          </DialogHeader>
          <ConfigForm
            tempConfig={tempConfig}
            setTempConfig={setTempConfig}
            onSave={handleSave}
            onCancel={() => setOpen(false)}
            commonConfigs={commonConfigs}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API 配置</DialogTitle>
          <DialogDescription>
            配置您的 AI API 接口信息，支持 OpenAI、Groq、DeepSeek 等多种服务商。
          </DialogDescription>
        </DialogHeader>
        <ConfigForm
          tempConfig={tempConfig}
          setTempConfig={setTempConfig}
          onSave={handleSave}
          onCancel={() => setOpen(false)}
          commonConfigs={commonConfigs}
        />
      </DialogContent>
    </Dialog>
  )
}

interface ConfigFormProps {
  tempConfig: ChatConfig
  setTempConfig: React.Dispatch<React.SetStateAction<ChatConfig>>
  onSave: () => void
  onCancel: () => void
  commonConfigs: Array<{ name: string; baseURL: string; model: string; cors: boolean }>
}

function ConfigForm({ tempConfig, setTempConfig, onSave, onCancel, commonConfigs }: ConfigFormProps) {
  return (
    <div className="space-y-4">
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

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={onSave} disabled={!tempConfig.apiKey}>
          保存配置
        </Button>
      </div>
    </div>
  )
}