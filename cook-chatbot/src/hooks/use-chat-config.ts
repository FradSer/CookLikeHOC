'use client'

import { useState, useEffect } from 'react'

export interface ChatConfig {
  apiKey: string
  baseURL: string
  model: string
}

const DEFAULT_CONFIG: ChatConfig = {
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
}

const CONFIG_STORAGE_KEY = 'cook-chatbot-config'

export function useChatConfig() {
  const [config, setConfigState] = useState<ChatConfig>(DEFAULT_CONFIG)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
      if (stored) {
        try {
          const parsedConfig = JSON.parse(stored)
          setConfigState(parsedConfig)
          setIsConfigured(!!parsedConfig.apiKey)
        } catch (error) {
          console.error('Failed to parse stored config:', error)
        }
      }
    }
  }, [])

  const setConfig = (newConfig: Partial<ChatConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfigState(updatedConfig)
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig))
    }
    setIsConfigured(!!updatedConfig.apiKey)
  }

  const resetConfig = () => {
    setConfigState(DEFAULT_CONFIG)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONFIG_STORAGE_KEY)
    }
    setIsConfigured(false)
  }

  return {
    config,
    setConfig,
    resetConfig,
    isConfigured,
    isClient,
  }
}