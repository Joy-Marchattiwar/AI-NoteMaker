import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingContent(e.target.value);
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {isEditing ? (
        <div className="border border-gray-300 rounded-md p-2">
          <textarea
            className="w-full p-4 border border-gray-200 rounded-md min-h-128"
            value={editingContent}
            onChange={handleChange}
          />
          <div className="flex justify-end gap-2 mt-4">
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
        <div className="prose max-w-none">
          <div className="mt-4 text-center">
            <button
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              onClick={handleEdit}
            >
              Edit Document
            </button>
          </div>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MarkdownDocument;
