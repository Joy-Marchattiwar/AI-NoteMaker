import React, { useState, useRef, useCallback, useMemo } from "react";
import "katex/dist/katex.min.css";
import { PdfSettingsPanel } from "./PdfSettingsPanel";
import { Editor } from "./Editor";
import { DocumentViewer } from "./DocumentViewer";
import { exportToPdf } from "../utils/pdfExport";
import { modifyContent } from "../utils/contentModifier";
import { refreshToken } from "../utils/auth";
import { Dialog, DialogTitle, DialogContent, DialogTrigger, DialogHeader, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "@/components/ui/label"
import { toast } from "sonner";

interface MarkdownDocumentProps {
  markdown: string;
  onSave?: (updatedMarkdown: string) => void;
  name: string
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  isEditing?: boolean;
  setIsEditing: (editing: boolean) => void;
}

const MarkdownDocument: React.FC<MarkdownDocumentProps> = React.memo(({
  markdown,
  onSave,
  name,
  isLoading,
  setLoading,
  isEditing,
  setIsEditing,
}) => {
  const [editingContent, setEditingContent] = useState<string>(markdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const markdownRef = useRef<HTMLDivElement | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [documentName, setDocumentName] = useState<string>(name);
  const [dialogOpen, setDialogOpen] = useState(false);
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
      setLoading(true);
      const newContent = await modifyContent(selectedText.trim());
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
        toast.success("Content modified successfully!");
      }
    } catch (error) {
      console.error("Error modifying content:", error);
      toast.error("Error modifying content. Please try again.");
    }
    finally{
      setLoading(false);
    }
  }, []);

  const handleExportToPdf = useCallback(async (docName: string) => {
    if (!markdownRef.current) return;
    try {
      setExportLoading(true);
      await exportToPdf(markdownRef.current, pdfSettings, refreshToken, docName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF. Please try again.");
    } finally {
      setExportLoading(false);
    }
  }, [pdfSettings]);


  const handleDialogSubmit = useCallback(async () => {
    setDialogOpen(false);
    await handleExportToPdf(documentName);
  }, [documentName, handleExportToPdf]);

  const editorComponent = useMemo(() => (
    <Editor
      textareaRef={textareaRef} 
      content={editingContent}
      onChange={handleChange}
      onModify={handleModify}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
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
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Please enter Document name</DialogTitle>
                <DialogDescription>
                  Name should be related to the content of the document. Keep it short and descriptive.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input 
                    id="name" 
                    className="col-span-3" 
                    value={documentName} 
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleDialogSubmit}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
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
          </Button>
        </div>
      </div>
      <DocumentViewer 
        ref={markdownRef} 
        markdown={markdown} 
      />
    </>
  ), [markdown, pdfSettings, exportLoading, handleEdit, dialogOpen, documentName, handleDialogSubmit]);

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {isEditing ? editorComponent : viewerComponent}
    </div>
  );
});

export default MarkdownDocument;