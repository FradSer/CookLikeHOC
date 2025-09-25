'use client'

import { useState, useCallback } from 'react'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { useChatConfig } from '@/hooks/use-chat-config'
import { Message } from '@/components/ai-elements/message'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDialog } from './config-dialog'
import { needsCorsProxy, getCorsProxyUrl, getApiHeaders, formatApiRequest, getEndpointUrl } from '@/lib/api-proxy'
import ReactMarkdown from 'react-markdown'
import { ENHANCED_COOKING_SYSTEM_PROMPT } from '@/data/cooking-prompt'
import { RecipeTooltip } from '@/components/ui/recipe-tooltip'

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
  const { config, isConfigured, isClient } = useChatConfig()
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

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: ''
    }

    // 保存当前消息历史
    const currentMessages = messages

    // 添加用户消息和助手占位消息
    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 检查是否需要 CORS 代理
      if (needsCorsProxy(config.baseURL)) {
        // 对于 CORS 问题，直接显示错误消息
        const errorContent = `由于浏览器的 CORS 安全限制，无法直接访问此 API 端点。

解决方案：
1. 使用支持 CORS 的 API（如 OpenAI、Groq、DeepSeek）
2. 在本地环境中通过代理服务器访问
3. 使用浏览器插件禁用 CORS 检查（不推荐）

推荐使用以下支持 CORS 的替代方案：
• OpenAI API (api.openai.com)
• Groq API (api.groq.com)
• DeepSeek API (api.deepseek.com)`

        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: errorContent }
            : msg
        ))
      } else {
        // 处理正常的 API 请求
        // 确保使用正确的 chat completions endpoint
        const baseURL = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL
        const openai = createOpenAI({
          apiKey: config.apiKey,
          baseURL: baseURL,
          compatibility: 'compatible',
        })

        // 为不同的 API 提供商使用不同的配置
        const streamConfig = {
          model: openai.chat(config.model),
          system: ENHANCED_COOKING_SYSTEM_PROMPT,
          messages: [...currentMessages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          maxTokens: 2000,
          temperature: 0.7,
        }

        // 对于 Groq，添加额外的配置
        if (config.baseURL.includes('groq.com')) {
          streamConfig.temperature = 0.5 // Groq 偏好较低的温度
        }

        const result = await streamText(streamConfig)

        let fullContent = ''
        try {
          for await (const textPart of result.textStream) {
            if (textPart && typeof textPart === 'string') {
              fullContent += textPart
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: fullContent }
                  : msg
              ))
            }
          }
        } catch (streamError) {
          console.error('Stream processing error:', streamError)
          // 尝试使用完整文本而不是流
          try {
            const fullText = await result.text
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: fullText }
                : msg
            ))
          } catch (textError) {
            console.error('Text fallback error:', textError)
            throw streamError
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorContent = '抱歉，遇到了一些问题。请检查您的 API 配置或稍后重试。错误信息：' + (error as Error).message

      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id
          ? { ...msg, content: errorContent }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }, [input, config, isLoading, messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  // 防止 SSR 问题
  if (!isClient) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🐔</div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🐔 HOC 做菜问答助手</h1>
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
            <h1 className="text-2xl font-bold">🐔 HOC 做菜问答助手</h1>
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
          <div className="h-full overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`p-4 rounded-2xl shadow-sm border ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 ml-auto max-w-md'
                  : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 mr-auto max-w-3xl'
              }`}>
                <div className="text-xs font-semibold mb-3 flex items-center gap-2">
                  {message.role === 'user' ? (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700">用户</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🐔</span>
                      <span className="text-orange-700">HOC 助手</span>
                    </>
                  )}
                </div>
                <div className="text-gray-800 leading-relaxed">
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-800 prose-li:text-gray-800">
                      <ReactMarkdown
                        components={{
                          a: ({ node, href, children, ...props }) => {
                            // Check if this is a recipe link pattern
                            if (href && href.match(/^\/.*\.md$/)) {
                              return (
                                <RecipeTooltip recipePath={href}>
                                  {children}
                                </RecipeTooltip>
                              )
                            }
                            return <a href={href} {...props}>{children}</a>
                          }
                        }}
                      >
                        {message.content || '正在思考中...'}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-orange-600 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 mr-auto max-w-xs">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm font-medium">正在思考中...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="问我任何烹饪问题..."
            disabled={isLoading}
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? '思考中...' : '发送'}
          </Button>
        </form>
      </div>
    </div>
  )
}