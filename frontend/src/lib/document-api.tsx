import type { Document } from "./types"

// Mock data for demonstration
const mockDocuments: Record<string, Document> = {
  "doc-1": {
    id: "doc-1",
    title: "Introduction to Machine Learning",
    blocks: [
      {
        id: "block-1",
        type: "text",
        content:
          "Machine Learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.",
        position: { x: 0, y: 0 },
      },
      {
        id: "block-2",
        type: "image",
        content: "/placeholder.svg?height=300&width=500",
        position: { x: 0, y: 0 },
      },
      {
        id: "block-3",
        type: "text",
        content:
          "There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.",
        position: { x: 0, y: 0 },
      },
    ],
  },
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Fetch document from API
export async function fetchDocument(documentId: string): Promise<Document> {
  await delay(800) // Simulate network delay

  const document = mockDocuments[documentId]

  if (!document) {
    throw new Error(`Document with ID ${documentId} not found`)
  }

  return document
}

// Update document via API
export async function updateDocument(documentId: string, updates: Partial<Document>): Promise<Document> {
  await delay(800) // Simulate network delay

  const document = mockDocuments[documentId]

  if (!document) {
    throw new Error(`Document with ID ${documentId} not found`)
  }

  const updatedDocument = {
    ...document,
    ...updates,
  }

  mockDocuments[documentId] = updatedDocument

  return updatedDocument
}

// Rewrite content via API
export async function rewriteContent(content: string, type: "text" | "image"): Promise<string> {
  await delay(1200) // Simulate AI processing time

  if (type === "text") {
    // Simulate AI rewriting text
    return `${content} [This content has been rewritten by AI to be more concise and educational.]`
  } else if (type === "image") {
    // For images, we'd typically generate or find a new image
    // For this demo, we'll just return a different placeholder
    return `/placeholder.svg?height=300&width=500&text=Rewritten`
  }

  return content
}

