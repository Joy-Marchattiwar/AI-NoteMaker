"use client"

import { Edit, RefreshCw, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlockToolbarProps {
  onRewrite: () => void
  onDelete: () => void
  onEdit?: () => void
  isImage?: boolean
}

export function BlockToolbar({ onRewrite, onDelete, onEdit, isImage = false }: BlockToolbarProps) {
  return (
    <div className="absolute -top-10 right-0 flex items-center gap-1 bg-background border rounded-md shadow-sm p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          onRewrite()
        }}
        title="Rewrite content"
        className="h-8 w-8"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

      {isImage && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          title="Edit image URL"
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        title="Delete block"
        className="h-8 w-8 text-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  )
}

