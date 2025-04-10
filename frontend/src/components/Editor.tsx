import React from "react";

interface EditorProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onModify: () => void;
  onCancel: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

export const Editor = React.memo(({
  textareaRef,
  content,
  onChange,
  onModify,
  onCancel,
  onSave,
  isLoading
}: EditorProps) => {
  return (
    <div className="border border-gray-300 rounded-md p-2">
      <textarea
        ref={textareaRef}
        className="w-full p-4 border border-gray-200 rounded-md min-h-64"
        value={content}
        onChange={onChange}
        disabled={isLoading}
        rows={25}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          onClick={onModify}
        >
          Modify
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </div>
  );
});