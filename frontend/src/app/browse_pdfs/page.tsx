"use client";

import { useState } from "react";
import axios from "axios";
import SearchBar from "@/components/ui/searchbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://bug-free-fortnight-ggxqrr4579v2wr79-8000.app.github.dev/search_pdfs/?topic=${query}`
      );
      console.log(response);
      if (response.status === 204) {
        toast.error("No PDFs found.")
        setDocuments([]);
      } else {
        console.log(response.data.result);
        setDocuments(response.data.result);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Failed to fetch documents.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Search Documents</h1>
      <div className="flex flex-col items-center mb-6">
      <div className="max-w-md mb-2">
        <SearchBar onSearch={(query) => fetchDocuments(query)} />
      </div>
  
      <div className="h-6 flex items-center justify-center">
        {loading && <div className="loader"></div>}
        {error && 
          <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
       </Alert>}
      </div>
</div>

      

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
