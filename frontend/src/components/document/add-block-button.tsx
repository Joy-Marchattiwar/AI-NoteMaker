"use client"
import { Plus, Type, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AddBlockButtonProps {
  onAddBlock: (type: "text" | "image") => void
}

export function AddBlockButton({ onAddBlock }: AddBlockButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAddBlock("text")}>
          <Type className="h-4 w-4 mr-2" />
          Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddBlock("image")}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

