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
  const [pdfSettings, setPdfSettings] = useState({
    lineSpacing: 1.5,
    pageBreaks: true,
    fontSize: 12,
    margins: 15, // mm
    showPageNumbers: true,
  });

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

  // Function to apply custom styling for PDF export
  const prepareForPdfExport = () => {
    if (!markdownRef.current) return;

    // Create a clone of the content to avoid modifying the visible DOM
    const contentClone = markdownRef.current.cloneNode(true) as HTMLElement;
    const tempContainer = document.createElement("div");
    tempContainer.appendChild(contentClone);

    // Apply PDF-specific styles
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      * {
        font-family: 'Helvetica', Arial, sans-serif;
      }
      p, li, blockquote, table td, table th {
        line-height: ${pdfSettings.lineSpacing} !important;
        font-size: ${pdfSettings.fontSize}pt !important;
      }
      h1 { font-size: ${pdfSettings.fontSize * 2}pt !important; margin-bottom: 20px !important; }
      h2 { font-size: ${pdfSettings.fontSize * 1.5}pt !important; margin-bottom: 16px !important; }
      h3 { font-size: ${pdfSettings.fontSize * 1.2}pt !important; margin-bottom: 14px !important; }
      pre, code { page-break-inside: avoid; }
      img { page-break-inside: avoid; max-width: 100%; height: auto; }
      ul, ol { padding-left: 20px !important; }
      .page-break { page-break-after: always; height: 0; }
    `;
    tempContainer.appendChild(styleElement);

    // Add page breaks before major headers if page breaks are enabled
    if (pdfSettings.pageBreaks) {
      const headers = contentClone.querySelectorAll("h1, h2");
      headers.forEach((header, index) => {
        // Skip the first header to avoid a page break at the beginning
        if (index > 0) {
          const pageBreakDiv = document.createElement("div");
          pageBreakDiv.className = "page-break";
          header.parentNode?.insertBefore(pageBreakDiv, header);
        }
      });
    }
    const images = contentClone.querySelectorAll("img");
    images.forEach((img) => {
      const originalSrc = img.getAttribute("src");
      if (originalSrc && !originalSrc.startsWith("data:")) {
        const proxiedUrl = `http://127.0.0.1:8000/proxy-image/?url=${encodeURIComponent(originalSrc)}`;
        console.log(`Rewriting image URL: ${originalSrc} -> ${proxiedUrl}`);
        img.setAttribute("src", proxiedUrl);
      }
    });

    return tempContainer;
  };

  const exportToPdf = async () => {
    if (!markdownRef.current) return;

    try {
      setExportLoading(true);
      const filename = `NoteCraft-${new Date().toISOString().slice(0, 10)}.pdf`;

      // Get prepared content with improved styling and page breaks
      const preparedContent = prepareForPdfExport();
      if (!preparedContent) return;

      // Temporarily append the prepared content to the document body
      preparedContent.style.position = "absolute";
      preparedContent.style.top = "-9999px";
      preparedContent.style.width = "794px"; // A4 width at 96 DPI
      document.body.appendChild(preparedContent);

      // Create PDF (A4 size)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const contentWidth = preparedContent.offsetWidth;

      // Calculate the scaling factor
      const scale = (pdfWidth - pdfSettings.margins * 2) / contentWidth;

      // Get the actual height of the content
      const contentHeight = preparedContent.offsetHeight;

      // Calculate how many pages we'll need
      const pageHeight = pdfHeight - pdfSettings.margins * 2;
      const totalPages = Math.ceil((contentHeight * scale) / pageHeight);

      // Determine position for each page's content
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Add page number if enabled
        if (pdfSettings.showPageNumbers) {
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            `Page ${page + 1} of ${totalPages}`,
            pdfWidth / 2,
            pdfHeight - 5,
            { align: "center" },
          );
        }

        // Calculate which portion of the content to capture for this page
        const yStart = (pageHeight / scale) * page;

        // Create canvas for this page
        const canvas = await html2canvas(preparedContent, {
          scale: 2, // Higher resolution
          useCORS: true,
          logging: false,
          y: yStart,
          height: pageHeight / scale,
          windowHeight: contentHeight,
        });

        // Add the image to the PDF
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(
          imgData,
          "PNG",
          pdfSettings.margins,
          pdfSettings.margins,
          pdfWidth - pdfSettings.margins * 2,
          0, // Let height be calculated automatically to maintain aspect ratio
          "",
          "FAST",
        );
      }

      // Save the PDF
      pdf.save(filename);

      // Clean up
      document.body.removeChild(preparedContent);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // UI for PDF export settings
  const PdfSettingsPanel = () => (
    <div className="bg-gray-50 p-4 rounded-md mb-4">
      <h3 className="text-lg font-medium mb-3">PDF Export Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Line Spacing
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={pdfSettings.lineSpacing}
            onChange={(e) =>
              setPdfSettings({
                ...pdfSettings,
                lineSpacing: parseFloat(e.target.value),
              })
            }
          >
            <option value="1">Single</option>
            <option value="1.15">Narrow</option>
            <option value="1.5">1.5 lines</option>
            <option value="2">Double</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Size
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={pdfSettings.fontSize}
            onChange={(e) =>
              setPdfSettings({
                ...pdfSettings,
                fontSize: parseInt(e.target.value),
              })
            }
          >
            <option value="10">Small (10pt)</option>
            <option value="12">Normal (12pt)</option>
            <option value="14">Large (14pt)</option>
            <option value="16">Extra Large (16pt)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Margins
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={pdfSettings.margins}
            onChange={(e) =>
              setPdfSettings({
                ...pdfSettings,
                margins: parseInt(e.target.value),
              })
            }
          >
            <option value="10">Narrow (10mm)</option>
            <option value="15">Normal (15mm)</option>
            <option value="25">Wide (25mm)</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="pageBreaks"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={pdfSettings.pageBreaks}
            onChange={(e) =>
              setPdfSettings({ ...pdfSettings, pageBreaks: e.target.checked })
            }
          />
          <label
            htmlFor="pageBreaks"
            className="ml-2 block text-sm text-gray-700"
          >
            Add page breaks at headings
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="showPageNumbers"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={pdfSettings.showPageNumbers}
            onChange={(e) =>
              setPdfSettings({
                ...pdfSettings,
                showPageNumbers: e.target.checked,
              })
            }
          />
          <label
            htmlFor="showPageNumbers"
            className="ml-2 block text-sm text-gray-700"
          >
            Show page numbers
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {isEditing ? (
        <div className="border border-gray-300 rounded-md p-2">
          <textarea
            ref={textareaRef}
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
          <div className="flex flex-col mb-4">
            {/* PDF Settings Panel */}
            <PdfSettingsPanel />

            <div className="flex justify-end">
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
