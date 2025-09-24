#!/usr/bin/env node
// 构建菜谱知识库脚本

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../')

// 分类映射
const categoryMap = {
  '炒菜': 'stir-fry',
  '蒸菜': 'steamed',
  '配料': 'ingredients',
  '汤': 'soup',
  '凉拌': 'cold-dish',
  '烫菜': 'blanched',
  '主食': 'staple',
  '早餐': 'breakfast',
  '煮锅': 'boiled',
  '砂锅菜': 'casserole',
  '炖菜': 'stewed',
  '烤类': 'grilled',
  '饮品': 'drinks',
  '卤菜': 'braised',
  '炸品': 'fried'
}

async function buildRecipeKnowledge() {
  const recipes = []

  for (const [category, categoryEn] of Object.entries(categoryMap)) {
    const categoryPath = path.join(rootDir, category)

    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'))

      for (const file of files) {
        try {
          const filePath = path.join(categoryPath, file)
          const content = fs.readFileSync(filePath, 'utf-8')
          const recipeName = file.replace('.md', '')

          // 解析菜谱结构
          const recipe = parseRecipe(content, recipeName, category)
          if (recipe) {
            recipes.push(recipe)
          }
        } catch (error) {
          console.log(`Error processing ${file}:`, error.message)
        }
      }
    }
  }

  // 生成知识库文件
  const knowledgeBase = {
    recipes,
    categories: Object.keys(categoryMap),
    totalRecipes: recipes.length,
    generatedAt: new Date().toISOString()
  }

  // 选择最具代表性的菜谱作为示例
  const exemplaryRecipes = selectExemplaryRecipes(recipes)

  // 生成系统提示词
  const systemPrompt = generateSystemPrompt(exemplaryRecipes)

  // 写入文件
  const outputDir = path.join(__dirname, '../src/data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(
    path.join(outputDir, 'recipe-knowledge.json'),
    JSON.stringify(knowledgeBase, null, 2)
  )

  fs.writeFileSync(
    path.join(outputDir, 'cooking-prompt.ts'),
    `// 自动生成的烹饪助手系统提示词
export const ENHANCED_COOKING_SYSTEM_PROMPT = \`${systemPrompt}\`;
`
  )

  console.log(`✅ 构建完成：${recipes.length} 个菜谱`)
  console.log(`📁 输出文件：`)
  console.log(`   - recipe-knowledge.json`)
  console.log(`   - cooking-prompt.ts`)
}

function parseRecipe(content, name, category) {
  try {
    const lines = content.split('\n').filter(line => line.trim())
    const recipe = {
      name,
      category,
      ingredients: [],
      steps: [],
      content: content.trim()
    }

    let currentSection = null

    for (const line of lines) {
      if (line.startsWith('# ')) {
        recipe.name = line.substring(2).trim()
      } else if (line.includes('原料') || line.includes('食材')) {
        currentSection = 'ingredients'
      } else if (line.includes('步骤') || line.includes('做法')) {
        currentSection = 'steps'
      } else if (line.startsWith('- ') && currentSection) {
        const item = line.substring(2).trim()
        if (currentSection === 'ingredients') {
          recipe.ingredients.push(item)
        } else if (currentSection === 'steps') {
          recipe.steps.push(item)
        }
      }
    }

    return recipe
  } catch (error) {
    console.log(`Error parsing recipe ${name}:`, error.message)
    return null
  }
}

function selectExemplaryRecipes(recipes) {
  // 从每个分类选择1-2个代表性菜谱
  const categoryGroups = {}
  recipes.forEach(recipe => {
    if (!categoryGroups[recipe.category]) {
      categoryGroups[recipe.category] = []
    }
    categoryGroups[recipe.category].push(recipe)
  })

  const exemplary = []
  Object.entries(categoryGroups).forEach(([category, recipes]) => {
    // 选择步骤完整且有原料的菜谱
    const goodRecipes = recipes.filter(r =>
      r.ingredients.length > 0 && r.steps.length > 0
    ).slice(0, 2)

    exemplary.push(...goodRecipes)
  })

  return exemplary.slice(0, 20) // 最多20个示例
}

function generateSystemPrompt(exemplaryRecipes) {
  const recipeExamples = exemplaryRecipes.map(recipe => {
    return `【${recipe.name}】(${recipe.category})
原料：${recipe.ingredients.join('、')}
步骤：${recipe.steps.join(' ')}`
  }).join('\n\n')

  return `你是一位专业的烹饪助手和美食专家，特别擅长老乡鸡风味的家常菜制作。你拥有丰富的菜谱知识库，包含${exemplaryRecipes.length}道经典菜谱。

核心职责：
1. 食谱推荐和制作步骤指导
2. 食材搭配和营养建议
3. 烹饪技巧和方法指导
4. 厨房工具使用建议
5. 食物保存和安全知识
6. 各种菜系的特色介绍
7. 根据现有食材推荐菜谱
8. 解决烹饪过程中遇到的问题

菜谱知识库示例：
${recipeExamples}

回答要点：
- 优先参考知识库中的经典菜谱制作方法
- 提供具体可操作的建议和详细步骤
- 考虑不同技能水平的用户需求
- 提供替代食材和小贴士
- 保持回答的实用性和可行性
- 如果询问非烹饪问题，请友好地引导回烹饪话题

请用友善、专业且详细的语言回答用户的问题。`
}

// 执行构建
buildRecipeKnowledge().catch(console.error)