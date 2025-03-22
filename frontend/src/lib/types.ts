export interface DocumentBlock {
    id: string
    type: "text" | "image"
    content: string
    position?: {
      x: number
      y: number
    }
  }
  
  export interface Document {
    id: string
    title: string
    blocks: DocumentBlock[]
  }
  
  