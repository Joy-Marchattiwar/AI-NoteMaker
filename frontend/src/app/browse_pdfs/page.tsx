"use client";

import { useState } from "react";
import axios from "axios";

interface Document {
  id: string;
  topic: string;
  uploaded_by: string;
  created_at: string;
  first_page_base64?: string;
  pdf_url: string;
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    console.log(searchQuery)
    if (!searchQuery.trim()) return;
    console.log(searchQuery)
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/search_pdfs/?topic=${searchQuery}`
      );
      if (response.data.result.length === 0) {
        setError("No PDFs found.");
        setDocuments([]);
      } else {
        console.log(response.data.result);
        setDocuments(response.data.result);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Search Documents</h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-3 border rounded-md w-1/2"
        />
        <button
          onClick={fetchDocuments}
          className="ml-2 p-3 bg-blue-600 text-white rounded-md"
        >
          Search
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <p className="text-center text-gray-600">Loading...</p>}

      {/* Error Message */}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Document List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <a
            key={doc.id}
            href={doc.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300"
          >
            {doc.first_page_base64 ? (
              <img
                src={`${doc.first_page_base64}`}
                alt={doc.topic}
                className="w-full h-40 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center bg-gray-200 rounded-md">
                No Preview Available
              </div>
            )}
            <h2 className="mt-2 text-lg font-semibold">{doc.topic}</h2>
            <p className="text-gray-500">By: {doc.uploaded_by}</p>
            <p className="text-gray-400 text-sm">
              Created: {new Date(doc.created_at).toLocaleDateString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DocumentsPage;
