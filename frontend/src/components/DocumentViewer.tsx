import React, { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface DocumentViewerProps {
  markdown: string;
}

export const DocumentViewer = forwardRef<HTMLDivElement, DocumentViewerProps>(
  ({ markdown }, ref) => {
    return (
      <div ref={ref} className="prose max-w-none p-4 bg-white">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {markdown}
        </ReactMarkdown>
      </div>
    );
  }
);

DocumentViewer.displayName = "DocumentViewer";

