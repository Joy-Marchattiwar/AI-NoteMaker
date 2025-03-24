import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import axios from "axios";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
interface MarkdownDocumentProps {
  markdown: string;
  onSave?: (updatedMarkdown: string) => void;
}

const MarkdownDocument: React.FC<MarkdownDocumentProps> = ({
  markdown,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<string>(markdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const markdownRef = useRef<HTMLDivElement | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const handleEdit = () => {
    setEditingContent(markdown);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editingContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };
  const handleModify = async () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    console.log("Selected text:", selectedText);
    if (!selectedText) return;
    try {
      const imageRegex = /!\[(.*?)\]\((.*?)\)/;
      const isImageMarkdown = imageRegex.test(selectedText);
      let response;

      if (isImageMarkdown) {
        const matches = selectedText.match(imageRegex);
        const altText = matches ? matches[1] : "";
        response = await axios.post("http://127.0.0.1:8000/modify_image/", {
          imgText: altText,
        });
      } else {
        response = await axios.post("http://127.0.0.1:8000/modify_text/", {
          text: selectedText,
        });
      }
      console.log(response);
      if (response && response.data) {
        const newContent = response.data.modifiedContent;
        // const newContent = "newContent added";
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end);
        textarea.value = textBefore + newContent + textAfter;
        setEditingContent(textarea.value);
        // Position cursor after inserted content
        const newPosition = start + newContent.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
    } catch (error) {
      console.error("Error modifying content:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingContent(e.target.value);
  };
  const exportToPdf = async () => {
    if (!markdownRef.current) return;

    try {
      setExportLoading(true);

      const filename = `NoteCraft-${new Date().toISOString().slice(0, 10)}.pdf`;

      // Get the content div
      const contentElement = markdownRef.current;

      // Calculate dimensions
      const originalWidth = contentElement.offsetWidth;
      const originalHeight = contentElement.offsetHeight;

      // Create canvas from the HTML content
      const canvas = await html2canvas(contentElement, {
        scale: 2, // Higher resolution
        useCORS: true, // Allow loading images from other domains
        logging: false,
      });

      // Calculate PDF dimensions (A4 format)
      const pdfWidth = 210; // mm
      const pdfHeight = (originalHeight * pdfWidth) / originalWidth;

      // Create PDF
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add the image to the PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {isEditing ? (
        <div className="border border-gray-300 rounded-md p-2">
          <textarea
            className="w-full p-4 border border-gray-200 rounded-md min-h-64"
            value={editingContent}
            onChange={handleChange}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={handleModify}
            >
              Modify
            </button>
            <button
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-end mb-4">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
              onClick={exportToPdf}
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
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 ml-2"
              onClick={handleEdit}
            >
              Edit Document
            </button>
          </div>

          <div ref={markdownRef} className="prose max-w-none p-4 bg-white">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownDocument;
