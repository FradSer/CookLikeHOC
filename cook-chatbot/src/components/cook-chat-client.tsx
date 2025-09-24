'use client'

import { useState, useCallback } from 'react'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { useChatConfig } from '@/hooks/use-chat-config'
import { Message } from '@/components/ai-elements/message'
import { PromptInput } from '@/components/ai-elements/prompt-input'
import { Button } from '@/components/ui/button'
import { ConfigDialog } from './config-dialog'

const COOKING_SYSTEM_PROMPT = `你是一位专业的烹饪助手和美食专家。你的职责是帮助用户解决所有与烹饪相关的问题，包括但不限于：

1. 食谱推荐和制作步骤
2. 食材搭配和营养建议
3. 烹饪技巧和方法指导
4. 厨房工具使用建议
5. 食物保存和安全知识
6. 各国菜系的特色介绍
7. 根据现有食材推荐菜谱
8. 解决烹饪过程中遇到的问题

请用友善、专业且详细的语言回答用户的问题。如果用户询问非烹饪相关的问题，请友好地提醒他们你是专门的烹饪助手，并引导他们问一些烹饪相关的问题。

回答要点：
- 提供具体可操作的建议
- 包含详细的步骤说明
- 考虑不同技能水平的用户
- 提供替代方案和小贴士
- 保持回答的实用性和可行性`

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function CookChatClient() {
  const { config, isConfigured } = useChatConfig()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !config.apiKey || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const openai = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      }

      setMessages(prev => [...prev, assistantMessage])

      const result = await streamText({
        model: openai(config.model),
        system: COOKING_SYSTEM_PROMPT,
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        maxTokens: 2000,
        temperature: 0.7,
      })

      let fullContent = ''
      for await (const textPart of result.textStream) {
        fullContent += textPart
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: fullContent }
            : msg
        ))
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，遇到了一些问题。请检查您的 API 配置或稍后重试。'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, config, messages, isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  if (!isConfigured) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🍳 做菜问答助手</h1>
          <p className="text-muted-foreground">
            专业的烹饪助手，帮你解决所有做菜相关的问题
          </p>
        </div>
        <ConfigDialog />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🍳 做菜问答助手</h1>
            <p className="text-sm text-muted-foreground">
              专业的烹饪助手，随时为你解答烹饪问题
            </p>
          </div>
          <ConfigDialog />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">👨‍🍳</div>
              <h2 className="text-xl font-semibold">开始你的烹饪之旅</h2>
              <p className="text-muted-foreground max-w-md">
                问我任何关于烹饪的问题：食谱、技巧、食材搭配、营养建议等
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-sm">
                <Button variant="outline" size="sm" onClick={() => handleSuggestionClick('推荐一道简单的家常菜')}>
                  推荐家常菜
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSuggestionClick('如何做出嫩滑的鸡蛋羹？')}>
                  鸡蛋羹制作
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSuggestionClick('有土豆和胡萝卜，能做什么菜？')}>
                  食材搭配
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>正在思考中...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <PromptInput
            value={input}
            onChange={handleInputChange}
            placeholder="问我任何烹饪问题..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? '思考中...' : '发送'}
          </Button>
        </form>
      </div>
    </div>
  )
}