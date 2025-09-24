import { createOpenAI } from '@ai-sdk/openai'

export interface OpenAIConfig {
  apiKey: string
  baseURL?: string
}

export function createOpenAIClient(config: OpenAIConfig) {
  return createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL || 'https://api.openai.com/v1',
  })
}

export const defaultConfig: Partial<OpenAIConfig> = {
  baseURL: 'https://api.openai.com/v1',
}