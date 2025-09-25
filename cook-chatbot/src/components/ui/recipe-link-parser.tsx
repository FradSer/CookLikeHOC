'use client'

import { RecipeTooltip } from './recipe-tooltip'

interface RecipeLinkParserProps {
  children: React.ReactNode
}

export function RecipeLinkParser({ children: text }: RecipeLinkParserProps) {
  // 匹配形如 [文本](/路径/文件名.md) 的链接
  const linkRegex = /\[([^\]]+)\]\((\/[^)]+\.md)\)/g

  if (!linkRegex.test(text)) {
    return <span>{text}</span>
  }

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // 重置正则表达式
  linkRegex.lastIndex = 0

  while ((match = linkRegex.exec(text)) !== null) {
    const [fullMatch, linkText, recipePath] = match
    const matchIndex = match.index

    // 添加链接前的文本
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex))
    }

    // 添加带 tooltip 的链接
    parts.push(
      <RecipeTooltip key={`${recipePath}-${matchIndex}`} recipePath={recipePath}>
        {linkText}
      </RecipeTooltip>
    )

    lastIndex = matchIndex + fullMatch.length
  }

  // 添加剩余的文本
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return (
    <>
      {parts.map((part, index) =>
        typeof part === 'string' ? <span key={index}>{part}</span> : part
      )}
    </>
  )
}