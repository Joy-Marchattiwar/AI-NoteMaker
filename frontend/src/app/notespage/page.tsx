"use client";
import React, { useState, useRef, useEffect } from "react";
import SearchBar from "@/components/ui/searchbar";
import axios from "axios";
import "./styles.css";
import res from "./temp.json";
import MarkdownDocument from "@/components/EditableDocument";
import "katex/dist/katex.min.css";
import { toast } from "sonner";


const Page = () => {
  const [result, setResults] = useState<{
    message: string;
    notes: string;
  }>({
    message: "",
    notes: "",
  });
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (query: string) => {
    if (!query) return;
    setQuery(query);
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/generate_note/`,
        {
          params: { query: query },
        },
      );
      setResults(response.data);
      // setTimeout(() => {
      //   setResults(res);
      //   setLoading(false);
      // }, 5000);
      setLoading(false);
    } catch (error) {
      toast.error("Error occured while fetching notes please retry")
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
      <h1 className="text-4xl font-bold mt-12 mb-5">Build Notes</h1>
      <SearchBar onSearch={handleSearch} />
      {loading && <div className="loader mt-2"></div>}

      {result.notes && (
        <div className="w-full max-w-4xl mt-8">
          <MarkdownDocument
            markdown={replaceMathDelimiters(result.notes)}
            onSave={handleSaveMarkdown}
            name={query}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(Page);
