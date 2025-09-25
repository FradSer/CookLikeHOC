'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CookingTerm, findCookingTerm } from '@/data/cooking-terms'
import ReactMarkdown from 'react-markdown'

interface CookingTermModalProps {
  term: string
  children: React.ReactNode
}

export function CookingTermModal({ term, children }: CookingTermModalProps) {
  const [open, setOpen] = useState(false)
  const cookingTerm = findCookingTerm(term)

  if (!cookingTerm) {
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
            {cookingTerm.term}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {cookingTerm.description}
          </p>
        </DialogHeader>
        <div className="mt-4">
          <div className="prose max-w-none">
            <ReactMarkdown>
              {cookingTerm.details}
            </ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}