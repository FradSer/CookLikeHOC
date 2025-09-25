'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getRecipeByPath } from '@/lib/recipe-search'
import ReactMarkdown from 'react-markdown'

interface RecipeModalProps {
  recipePath: string
  children: React.ReactNode
}

export function RecipeModal({ recipePath, children }: RecipeModalProps) {
  const [open, setOpen] = useState(false)
  const [recipe, setRecipe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    if (newOpen && !recipe && !isLoading) {
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0 font-inherit">
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {recipe?.name || '菜谱详情'}
          </DialogTitle>
          {recipe?.category && (
            <p className="text-sm text-gray-600 mt-1">
              分类：{recipe.category}
            </p>
          )}
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center gap-2 justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
              <span>加载中...</span>
            </div>
          ) : recipe?.error ? (
            <div className="text-center py-8">
              <p className="text-red-600">无法加载菜谱内容</p>
              <p className="text-sm text-gray-500 mt-2">请检查文件路径：{recipePath}</p>
            </div>
          ) : recipe ? (
            <div className="prose max-w-none">
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">主要食材</h3>
                  <ul className="grid grid-cols-2 gap-1">
                    {recipe.ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="text-sm">{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.steps && recipe.steps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">制作步骤</h3>
                  <ol className="space-y-2">
                    {recipe.steps.map((step: string, index: number) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium text-blue-600">{index + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {recipe.rawContent && (
                <div className="mt-6">
                  <ReactMarkdown>
                    {recipe.rawContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">点击查看菜谱详情</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}