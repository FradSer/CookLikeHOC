'use client'

import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { getRecipeByPath } from '@/lib/recipe-search'

interface RecipeTooltipProps {
  recipePath: string
  children: React.ReactNode
}

export function RecipeTooltip({ recipePath, children }: RecipeTooltipProps) {
  const [recipe, setRecipe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (open: boolean) => {
    if (open && !recipe && !isLoading) {
      setIsLoading(true)
      try {
        const recipeData = getRecipeByPath(recipePath)
        setRecipe(recipeData)
      } catch (error) {
        console.error('Failed to load recipe:', error)
        setRecipe({ error: true })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <TooltipProvider>
      <Tooltip onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <span className="text-blue-600 hover:text-blue-800 underline cursor-pointer">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-md p-4 text-sm">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>加载中...</span>
            </div>
          ) : recipe?.error ? (
            <p className="text-red-600">无法加载菜谱内容</p>
          ) : recipe ? (
            <div className="space-y-2">
              <h4 className="font-semibold text-base">{recipe.name}</h4>
              <p className="text-xs text-gray-600">分类：{recipe.category}</p>
              {recipe.ingredients && (
                <div>
                  <p className="font-medium">主要食材：</p>
                  <p className="text-gray-700">{recipe.ingredients.slice(0, 3).join('、')}...</p>
                </div>
              )}
              {recipe.steps && recipe.steps.length > 0 && (
                <div>
                  <p className="font-medium">制作要点：</p>
                  <p className="text-gray-700">{recipe.steps[0].substring(0, 100)}...</p>
                </div>
              )}
            </div>
          ) : (
            <p>悬停查看菜谱详情</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}