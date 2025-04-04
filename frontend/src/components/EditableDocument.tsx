// MarkdownDocument.tsx
import React, { useState, useRef, useCallback, useMemo } from "react";
import "katex/dist/katex.min.css";
import { PdfSettingsPanel } from "./PdfSettingsPanel";
import { Editor } from "./Editor";
import { DocumentViewer } from "./DocumentViewer";
import { exportToPdf } from "../utils/pdfExport";
import { modifyContent } from "../utils/contentModifier";
import { refreshToken } from "../utils/auth";

interface MarkdownDocumentProps {
  markdown: string;
  onSave?: (updatedMarkdown: string) => void;
}

const MarkdownDocument: React.FC<MarkdownDocumentProps> = React.memo(({
  markdown,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<string>(markdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const markdownRef = useRef<HTMLDivElement | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [pdfSettings, setPdfSettings] = useState({
    lineSpacing: 1.5,
    pageBreaks: true,
    fontSize: 12,
    margins: 15,
    showPageNumbers: true,
  });

  // Event handlers
  const handleEdit = useCallback(() => {
    setEditingContent(markdown);
    setIsEditing(true);
  }, [markdown]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(editingContent);
    }
    setIsEditing(false);
  }, [editingContent, onSave]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingContent(e.target.value);
  }, []);


  const handleModify = useCallback(async () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText) return;
    
    try {
      const newContent = await modifyContent(selectedText);
      if (newContent) {
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end);
        const updatedContent = textBefore + newContent + textAfter;
        
        setEditingContent(updatedContent);
        
        // Position cursor after inserted content
        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = start + newContent.length;
            textareaRef.current.setSelectionRange(newPosition, newPosition);
            textareaRef.current.focus();
          }
        }, 0);
      }
    } catch (error) {
      console.error("Error modifying content:", error);
    }
  }, []);

  const handleExportToPdf = useCallback(async () => {
    if (!markdownRef.current) return;
    try {
      setExportLoading(true);
      await exportToPdf(markdownRef.current, pdfSettings, refreshToken);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setExportLoading(false);
    }
  }, [pdfSettings]);

  // Use memoized components to prevent unnecessary re-renders
  const editorComponent = useMemo(() => (
    <Editor
      textareaRef={textareaRef} 
      content={editingContent}
      onChange={handleChange}
      onModify={handleModify}
      onCancel={handleCancel}
      onSave={handleSave}
    />
  ), [editingContent, handleChange, handleModify, handleCancel, handleSave]);

  const viewerComponent = useMemo(() => (
    <>
      <div className="flex flex-col mb-4">
        <PdfSettingsPanel 
          settings={pdfSettings} 
          onSettingsChange={setPdfSettings} 
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
            onClick={handleExportToPdf}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <span>Exporting...</span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Export as PDF</span>
              </>
            )}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            onClick={handleEdit}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
              />
            </svg>
            <span>Edit Document</span>
          </button>
        </div>
      </div>
      <DocumentViewer 
        ref={markdownRef} 
        markdown={markdown} 
      />
    </>
  ), [markdown, pdfSettings, exportLoading, handleExportToPdf, handleEdit]);

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {isEditing ? editorComponent : viewerComponent}
    </div>
  );
});

export default MarkdownDocument;