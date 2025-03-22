"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { BookOpen, Save, Undo } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DocumentContent } from "./document-content"
import { fetchDocument, updateDocument } from "@/lib/document-api"
import type { DocumentBlock } from "@/lib/types"

interface DocumentEditorProps {
  documentId: string
}

export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [title, setTitle] = useState<string>("")
  const [blocks, setBlocks] = useState<DocumentBlock[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true)
        const document = await fetchDocument(documentId)
        setTitle(document.title)
        setBlocks(document.blocks)
      } catch (error) {
        console.error("Failed to load document:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDocument()
  }, [documentId])

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateDocument(documentId, { title, blocks })
    } catch (error) {
      console.error("Failed to save document:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleBlockUpdate = (updatedBlock: DocumentBlock) => {
    setBlocks(blocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block)))
  }

  const handleBlockReorder = (dragIndex: number, hoverIndex: number) => {
    const draggedBlock = blocks[dragIndex]
    const newBlocks = [...blocks]
    newBlocks.splice(dragIndex, 1)
    newBlocks.splice(hoverIndex, 0, draggedBlock)
    setBlocks(newBlocks)
  }

  const handleBlockSelect = (blockId: string | null) => {
    setSelectedBlockId(blockId)
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 w-full"
              placeholder="Document Title"
            />
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Undo className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <DndProvider backend={HTML5Backend}>
        <div className="bg-white rounded-lg border shadow-sm p-6 min-h-[70vh]">
          <DocumentContent
            blocks={blocks}
            onBlockUpdate={handleBlockUpdate}
            onBlockReorder={handleBlockReorder}
            selectedBlockId={selectedBlockId}
            onBlockSelect={handleBlockSelect}
          />
        </div>
      </DndProvider>
    </div>
  )
}

