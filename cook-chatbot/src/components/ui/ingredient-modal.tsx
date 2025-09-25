'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { IngredientFile, findIngredientFile } from '@/data/ingredient-files'
import ReactMarkdown from 'react-markdown'

interface IngredientModalProps {
  ingredientPath: string
  children: React.ReactNode
}

export function IngredientModal({ ingredientPath, children }: IngredientModalProps) {
  const [open, setOpen] = useState(false)
  const ingredientFile = findIngredientFile(ingredientPath)

  if (!ingredientFile) {
    return <>{children}</>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0 font-inherit">
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {ingredientFile.title}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            配料详情
          </p>
        </DialogHeader>
        <div className="mt-4">
          <div className="prose max-w-none">
            <ReactMarkdown>
              {ingredientFile.content}
            </ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}