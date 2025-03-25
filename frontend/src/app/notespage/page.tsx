"use client";
import React, { useState, useRef, useEffect } from "react";
import SearchBar from "@/components/ui/searchbar";
import axios from "axios";
import "./styles.css";
import res from "./temp.json";
import MarkdownDocument from "@/components/EditableDocument";
import "katex/dist/katex.min.css";

const Page = () => {
  const [result, setResults] = useState<{
    message: string;
    notes: string;
  }>({
    message: "",
    notes: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const notesRef = useRef<HTMLDivElement>(null);

  // Add useEffect to scroll when notes are loaded
  useEffect(() => {
    if (result.notes && !loading && notesRef.current) {
      notesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result.notes, loading]);
  const handleSearch = async (query: string) => {
    if (!query) return;
    try {
      setLoading(true);
      // const response = await axios.post(
      //   `http://127.0.0.1:8000/generate_note/`,
      //   {
      //     params: { query: query },
      //   },
      // );
      // console.log(response.data);
      // setResults(response.data);
      setResults(res);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSaveMarkdown = (updatedMarkdown: string) => {
    setResults((prev) => ({
      ...prev,
      notes: updatedMarkdown,
    }));
  };
  const replaceMathDelimiters = (text: string): string => {
    // Replace \[ and \] with $$ (display math)
    let updatedText = text.replace(/\\\[/g, "$$$");
    updatedText = updatedText.replace(/\\\]/g, "$$$");

    // Replace \( and \) with $ (inline math)
    updatedText = updatedText.replace(/\\\(/g, "$");
    updatedText = updatedText.replace(/\\\)/g, "$");

    return updatedText;
  };
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mt-12">Build Notes</h1>
      <SearchBar onSearch={handleSearch} />
      {loading && <div className="loader"></div>}

      {result.notes && (
        <div className="w-full max-w-4xl mt-8">
          <MarkdownDocument
            markdown={replaceMathDelimiters(result.notes)}
            onSave={handleSaveMarkdown}
          />
        </div>
      )}
    </div>
  );
};

export default Page;
