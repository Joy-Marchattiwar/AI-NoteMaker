"use client"

import type React from "react"

import { useRef } from "react"
import type { DocumentBlock } from "@/lib/types"
import { TextBlock } from "@/components/document/blocks/text-block"
import { ImageBlock } from "@/components/document/blocks/image-block"
import { AddBlockButton } from "@/components/document/add-block-button"

interface DocumentContentProps {
  blocks: DocumentBlock[]
  onBlockUpdate: (block: DocumentBlock) => void
  onBlockReorder: (dragIndex: number, hoverIndex: number) => void
  selectedBlockId: string | null
  onBlockSelect: (blockId: string | null) => void
}

export function DocumentContent({
  blocks,
  onBlockUpdate,
  onBlockReorder,
  selectedBlockId,
  onBlockSelect,
}: DocumentContentProps) {
  const documentRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (e: React.MouseEvent) => {
    if (documentRef.current && e.target === documentRef.current) {
      onBlockSelect(null)
    }
  }

  const renderBlock = (block: DocumentBlock, index: number) => {
    const isSelected = selectedBlockId === block.id

    switch (block.type) {
      case "text":
        return (
          <TextBlock
            key={block.id}
            block={block}
            index={index}
            isSelected={isSelected}
            onUpdate={onBlockUpdate}
            onReorder={onBlockReorder}
            onSelect={onBlockSelect}
          />
        )
      case "image":
        return (
          <ImageBlock
            key={block.id}
            block={block}
            index={index}
            isSelected={isSelected}
            onUpdate={onBlockUpdate}
            onReorder={onBlockReorder}
            onSelect={onBlockSelect}
          />
        )
      default:
        return null
    }
  }

  return (
    <div ref={documentRef} className="space-y-4 min-h-[60vh]" onClick={handleClickOutside}>
      {blocks.length > 0 ? (
        blocks.map((block, index) => renderBlock(block, index))
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <p className="text-muted-foreground mb-4">This document is empty. Add some content to get started.</p>
          <AddBlockButton
            onAddBlock={(type) => {
              const newBlock: DocumentBlock = {
                id: `block-${Date.now()}`,
                type,
                content: type === "text" ? "Start typing here..." : "/placeholder.svg?height=300&width=500",
                position: { x: 0, y: 0 },
              }
              onBlockUpdate(newBlock)
            }}
          />
        </div>
      )}

      {blocks.length > 0 && (
        <div className="pt-4 flex justify-center">
          <AddBlockButton
            onAddBlock={(type) => {
              const newBlock: DocumentBlock = {
                id: `block-${Date.now()}`,
                type,
                content: type === "text" ? "Start typing here..." : "/placeholder.svg?height=300&width=500",
                position: { x: 0, y: 0 },
              }
              onBlockUpdate(newBlock)
            }}
          />
        </div>
      )}
    </div>
  )
}

