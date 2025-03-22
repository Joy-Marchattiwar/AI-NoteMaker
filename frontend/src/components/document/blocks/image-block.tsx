import { useRef, useState, useEffect } from "react"
import { useDrag, useDrop } from "react-dnd"
import { GripVertical } from "lucide-react"
import Image from "next/image"
import type { DocumentBlock } from "@/lib/types"
import { BlockToolbar } from "@/components/document/block-toolbar"
import { rewriteContent } from "@/lib/document-api"
import { Input } from "@/components/ui/input"

interface ImageBlockProps {
  block: DocumentBlock
  index: number
  isSelected: boolean
  onUpdate: (block: DocumentBlock) => void
  onReorder: (dragIndex: number, hoverIndex: number) => void
  onSelect: (blockId: string | null) => void
}

export function ImageBlock({ block, index, isSelected, onUpdate, onReorder, onSelect }: ImageBlockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [imageUrl, setImageUrl] = useState(block.content)

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
      if (!ref.current) return

      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      onReorder(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const handleRewrite = async () => {
    try {
      const rewrittenContent = await rewriteContent(block.content, "image")
      onUpdate({ ...block, content: rewrittenContent })
    } catch (error) {
      console.error("Failed to rewrite content:", error)
    }
  }

  const handleDelete = () => {
    onUpdate({ ...block, content: "" })
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
  }

  const handleImageUrlSave = () => {
    onUpdate({ ...block, content: imageUrl })
    setIsEditing(false)
  }

  drag(drop(ref)) // Attach drag & drop to ref

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
      preview(ref.current);
    }
  }, [drag, preview]);
  

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
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="p-3 bg-white rounded-md">
        {isEditing ? (
          <div className="space-y-2">
            <Input value={imageUrl} onChange={handleImageUrlChange} placeholder="Enter image URL" className="w-full" />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleImageUrlSave}
                className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Image
              src={block.content || "/placeholder.svg"}
              alt="Document image"
              width={500}
              height={300}
              className="max-w-full h-auto rounded-md"
            />
          </div>
        )}
      </div>

      {isSelected && (
        <BlockToolbar
          onRewrite={handleRewrite}
          onDelete={handleDelete}
          onEdit={() => setIsEditing(true)}
          isImage={true}
        />
      )}
    </div>
  )
}
