// CORS 代理解决方案
export function getCorsProxyUrl(originalUrl: string): string {
  // 使用公共的 CORS 代理服务
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
  ]

  // 选择第一个可用的代理
  return `${corsProxies[0]}${encodeURIComponent(originalUrl)}`
}

export function needsCorsProxy(baseURL: string): boolean {
  // 检查是否需要 CORS 代理
  const corsProblematicDomains = [
    'ark.cn-beijing.volces.com', // 豆包
    'api.minimax.chat', // MiniMax
    'dashscope.aliyuncs.com', // 阿里云
  ]

  return corsProblematicDomains.some(domain => baseURL.includes(domain))
}

// 为特定 API 提供商创建请求头
export function getApiHeaders(baseURL: string, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (baseURL.includes('ark.cn-beijing.volces.com')) {
    // 豆包 API 特殊头部
    headers['Authorization'] = `Bearer ${apiKey}`
  } else if (baseURL.includes('api.deepseek.com')) {
    // DeepSeek API
    headers['Authorization'] = `Bearer ${apiKey}`
  } else {
    // 默认 OpenAI 格式
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  return headers
}

// 处理不同 API 的请求格式
export function formatApiRequest(baseURL: string, messages: any[], model: string, systemPrompt: string) {
  if (baseURL.includes('ark.cn-beijing.volces.com')) {
    // 豆包 API 格式
    return {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    }
  } else {
    // 标准 OpenAI 格式
    return {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    }
  }
}

// 获取正确的端点 URL
export function getEndpointUrl(baseURL: string): string {
  if (baseURL.includes('ark.cn-beijing.volces.com')) {
    return `${baseURL}/chat/completions`
  } else {
    return `${baseURL}/chat/completions`
  }
}