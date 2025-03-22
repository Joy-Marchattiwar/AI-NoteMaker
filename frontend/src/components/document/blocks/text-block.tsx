"use client"

import type React from "react"

import { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { GripVertical } from "lucide-react"
import type { DocumentBlock } from "@/lib/types"
import { BlockToolbar } from "@/components/document/block-toolbar"
import { rewriteContent } from "@/lib/document-api"

interface TextBlockProps {
  block: DocumentBlock
  index: number
  isSelected: boolean
  onUpdate: (block: DocumentBlock) => void
  onReorder: (dragIndex: number, hoverIndex: number) => void
  onSelect: (blockId: string | null) => void
}

export function TextBlock({ block, index, isSelected, onUpdate, onReorder, onSelect }: TextBlockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag, preview] = useDrag({
    type: "BLOCK",
    item: { id: block.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "BLOCK",
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return
      }

      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      onReorder(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...block,
      content: e.target.value,
    })
  }

  const handleRewrite = async () => {
    try {
      const rewrittenContent = await rewriteContent(block.content, "text")
      onUpdate({
        ...block,
        content: rewrittenContent,
      })
    } catch (error) {
      console.error("Failed to rewrite content:", error)
    }
  }

  const handleDelete = () => {
    // This would need to be implemented in the parent component
    // For now, we'll just replace with empty content
    onUpdate({
      ...block,
      content: "",
    })
  }

  drag(drop(ref))

  return (
    <div
      ref={ref}
      className={`relative group ${isDragging ? "opacity-50" : "opacity-100"} ${
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      } rounded-md transition-all`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(block.id)
      }}
      style={{
        position: "relative",
        left: block.position?.x || 0,
        top: block.position?.y || 0,
      }}
    >
      <div
        ref={ref}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="p-3 bg-white rounded-md">
        <textarea
          value={block.content}
          onChange={handleContentChange}
          className="w-full min-h-[100px] resize-y bg-transparent focus:outline-none"
          placeholder="Start typing here..."
        />
      </div>

      {isSelected && <BlockToolbar onRewrite={handleRewrite} onDelete={handleDelete} />}
    </div>
  )
}

