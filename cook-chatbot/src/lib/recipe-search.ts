// 菜谱智能检索功能
import recipeData from '@/data/recipe-knowledge.json'

export interface Recipe {
  name: string
  category: string
  ingredients: string[]
  steps: string[]
  content: string
}

// 简单的文本相似度匹配
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)

  const intersection = words1.filter(word => words2.includes(word))
  const union = [...new Set([...words1, ...words2])]

  return intersection.length / union.length
}

// 关键词提取
function extractKeywords(query: string): string[] {
  const keywords = []

  // 常见食材关键词
  const ingredients = ['鸡', '肉', '蛋', '菜', '豆', '丝', '花', '土豆', '萝卜', '白菜', '青菜', '豆腐', '鱼', '虾', '蘑菇', '番茄']

  // 烹饪方式关键词
  const methods = ['炒', '蒸', '煮', '炖', '烤', '炸', '拌', '烫', '卤', '焖']

  // 口味关键词
  const flavors = ['酸辣', '香辣', '清淡', '鲜美', '甜', '咸', '麻辣']

  const allKeywords = [...ingredients, ...methods, ...flavors]

  for (const keyword of allKeywords) {
    if (query.includes(keyword)) {
      keywords.push(keyword)
    }
  }

  return keywords
}

// 搜索菜谱
export function searchRecipes(query: string, limit: number = 5): Recipe[] {
  const recipes = recipeData.recipes as Recipe[]
  const keywords = extractKeywords(query)

  // 计算每个菜谱的相关性分数
  const scoredRecipes = recipes.map(recipe => {
    let score = 0

    // 名称匹配
    score += calculateSimilarity(query, recipe.name) * 3

    // 分类匹配
    if (keywords.some(k => recipe.category.includes(k))) {
      score += 2
    }

    // 食材匹配
    const allIngredients = recipe.ingredients.join(' ')
    score += calculateSimilarity(query, allIngredients) * 2

    // 关键词匹配
    for (const keyword of keywords) {
      if (recipe.name.includes(keyword)) score += 2
      if (recipe.content.includes(keyword)) score += 1
    }

    return { recipe, score }
  })

  // 按分数排序并返回前几个
  return scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.recipe)
}

// 根据食材推荐菜谱
export function recommendByIngredients(ingredients: string[]): Recipe[] {
  const recipes = recipeData.recipes as Recipe[]

  const scoredRecipes = recipes.map(recipe => {
    let score = 0
    const recipeIngredients = recipe.ingredients.join(' ').toLowerCase()

    for (const ingredient of ingredients) {
      if (recipeIngredients.includes(ingredient.toLowerCase())) {
        score += 1
      }
    }

    return { recipe, score }
  })

  return scoredRecipes
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(item => item.recipe)
}

// 获取分类菜谱
export function getRecipesByCategory(category: string): Recipe[] {
  const recipes = recipeData.recipes as Recipe[]
  return recipes.filter(recipe => recipe.category === category)
}

// 格式化菜谱为文本
export function formatRecipeForAI(recipe: Recipe): string {
  return `【${recipe.name}】(${recipe.category})
原料：${recipe.ingredients.join('、') || '未详细记录'}
制作步骤：${recipe.steps.join(' ') || '请参考完整内容'}

详细内容：
${recipe.content}`
}