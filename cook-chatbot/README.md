# 🍳 做菜问答助手

一个基于 Next.js 和 AI SDK 5 构建的专业烹饪问答 chatbot，支持多种 AI 提供商，部署在 GitHub Pages。

## ✨ 功能特性

- **专业烹饪指导**：专门针对烹饪相关问题优化的 AI 助手
- **多 AI 提供商支持**：支持 OpenAI、Groq、Ollama 等 OpenAI 兼容的 API
- **自定义配置**：可配置 API 密钥、base URL 和模型
- **响应式界面**：基于 AI Elements 和 Tailwind CSS 的现代化界面
- **静态部署**：完全客户端运行，支持 GitHub Pages 部署
- **流式对话**：支持实时流式响应，提供流畅的聊天体验

## 🚀 技术栈

- **前端框架**：Next.js 15 (App Router)
- **AI SDK**：Vercel AI SDK 5
- **UI 组件**：AI Elements + shadcn/ui
- **样式**：Tailwind CSS
- **类型安全**：TypeScript
- **包管理**：pnpm
- **部署**：GitHub Pages

## 📦 安装使用

### 本地开发

1. 克隆仓库
```bash
git clone <repository-url>
cd cook-chatbot
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm dev
```

4. 打开浏览器访问 `http://localhost:3000`

### 构建部署

```bash
# 构建静态文件
pnpm build

# 本地预览构建结果
pnpm start
```

## ⚙️ 配置说明

### 环境变量

参考 `.env.example` 文件，主要配置项：

```env
# OpenAI API 配置
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Groq API 配置
GROQ_API_KEY=your_groq_api_key
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.1-8b-instant

# Ollama 配置
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
```

### 支持的 AI 提供商

1. **OpenAI**
   - Base URL: `https://api.openai.com/v1`
   - 推荐模型: `gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`

2. **Groq**
   - Base URL: `https://api.groq.com/openai/v1`
   - 推荐模型: `llama-3.1-8b-instant`, `mixtral-8x7b-32768`

3. **Ollama** (本地部署)
   - Base URL: `http://localhost:11434/v1`
   - 推荐模型: `llama3.2`, `qwen2.5`, `gemma2`

4. **其他 OpenAI 兼容 API**
   - 支持任何兼容 OpenAI API 格式的服务

## 🎯 使用方法

1. **首次使用**：访问应用后会显示配置界面
2. **配置 API**：
   - 选择预设的 AI 提供商或输入自定义配置
   - 输入 API 密钥
   - 可选择修改 Base URL 和模型
3. **开始对话**：配置完成后即可开始与 AI 助手对话
4. **问题示例**：
   - "推荐一道简单的家常菜"
   - "如何做出嫩滑的鸡蛋羹？"
   - "有土豆和胡萝卜，能做什么菜？"

## 🏗️ 项目结构

```
cook-chatbot/
├── src/
│   ├── app/
│   │   ├── page.tsx           # 主页面
│   │   └── layout.tsx         # 根布局
│   ├── components/
│   │   ├── ai-elements/       # AI Elements 组件
│   │   ├── ui/               # shadcn/ui 组件
│   │   ├── cook-chat-client.tsx  # 主要聊天组件
│   │   └── config-dialog.tsx    # 配置对话框
│   ├── hooks/
│   │   └── use-chat-config.ts   # 聊天配置 Hook
│   └── lib/
│       └── openai.ts           # OpenAI 客户端配置
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions 部署配置
├── public/
│   └── .nojekyll              # GitHub Pages 配置
├── next.config.ts             # Next.js 配置
└── package.json
```

## 🚀 部署到 GitHub Pages

### 自动部署

1. Fork 或上传代码到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 "GitHub Actions" 作为部署源
4. 推送代码到 main 分支，会自动触发部署

### 手动部署

1. 本地构建：`pnpm build`
2. 将 `out` 目录内容上传到 GitHub Pages

## 🛠️ 开发指南

### 添加新的 AI 提供商

1. 在 `config-dialog.tsx` 中添加预设配置
2. 确保提供商 API 兼容 OpenAI 格式
3. 测试连接和响应

### 自定义系统提示词

修改 `cook-chat-client.tsx` 中的 `COOKING_SYSTEM_PROMPT` 常量。

### 添加新功能

1. 遵循现有的组件结构
2. 使用 TypeScript 确保类型安全
3. 利用 AI Elements 组件库

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
