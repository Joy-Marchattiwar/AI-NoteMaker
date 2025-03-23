import React, { useState, useEffect } from "react";

interface EditableDocumentProps {
  notes: (string | string[])[];
  onSave?: (updatedNotes: (string | string[])[]) => void;
}

const EditableDocument: React.FC<EditableDocumentProps> = ({
  notes: initialNotes,
  onSave,
}) => {
  const [notes, setNotes] = useState<(string | string[])[]>(initialNotes || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  useEffect(() => {
    setNotes(initialNotes || []);
  }, [initialNotes]);

  const handleEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditingContent(content);
  };

  const handleSave = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = editingContent;
    setNotes(updatedNotes);
    setEditingIndex(null);

    // Call parent save handler if provided
    if (onSave) {
      onSave(updatedNotes);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingContent(e.target.value);
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-6">
        {notes.map((item, index) => {
          // Check if the item is a string (text) or an array (images)
          if (typeof item === "string") {
            return editingIndex === index ? (
              <div
                key={index}
                className="border border-gray-300 rounded-md p-2"
              >
                <textarea
                  className="w-full p-2 border border-gray-200 rounded-md min-h-32"
                  value={editingContent}
                  onChange={handleChange}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => handleSave(index)}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={index}
                className="prose max-w-none cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                onClick={() => handleEdit(index, item)}
              >
                {item.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            );
          } else if (Array.isArray(item)) {
            // Handle image arrays
            return (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {item.map((imageUrl, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative h-48 border rounded-md overflow-hidden"
                  >
                    {/* Using regular img tag instead of Next.js Image component */}
                    <img
                      src={imageUrl}
                      alt={`Image ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* If needed, add a caption or edit option for images */}
                    <div className="absolute bottom-0 right-0 bg-white bg-opacity-80 p-1 text-xs">
                      Image {imgIndex + 1}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default EditableDocument;
