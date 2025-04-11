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
    success: boolean;
    notes: string;
  }>({
    success: false,
    notes: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const taskIdRef = useRef<string | null>(null);
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (taskIdRef.current) {
        const data = JSON.stringify({ task_id: taskIdRef });
        navigator.sendBeacon('/cancel_task/', data);
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [taskIdRef.current
  ]);
  // Inside your frontend (e.g., notes page)
  useEffect(() => {
    fetch("https://notecraft-1.onrender.com/")
      .then(() => console.log("Pinged Celery service"));
  }, []);

  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const pollTaskStatus = async (taskId: string |null)=> {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`https://notecraft-backend-ag98.onrender.com/task_status/${taskId}/`);
        const status = res.data.status || res.data.state;
        
        if (status === "done" || status === "SUCCESS") {
          clearInterval(interval);
          setResults(res.data.result);
          setLoading(false);
        } else if (status === "failed" || status === "error") {
          clearInterval(interval);
          toast.error("Failed to generate notes.");
          setLoading(false);
        }
      } catch (err) {
        clearInterval(interval);
        toast.error("Something went wrong while checking status.");
        setLoading(false);
      }
    }, 10000);
  };
  
  const handleSearch = async (query: string) => {
    if (!query) return;
    setQuery(query);
    try {
      setLoading(true);
      const response = await axios.post(
        `https://notecraft-backend-ag98.onrender.com/generate_note/`,
        {
          params: { query: query },
        },
      );
      taskIdRef.current = response.data.task_id;
      pollTaskStatus(taskIdRef.current);
      // setResults(response.data);
      // setTimeout(() => {
      //   setResults(res);
      //   setLoading(false);
      // }, 5000);
      // setLoading(false);
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
      <h1 className="text-4xl font-bold mt-12 mb-3">Build Notes</h1>
      <p className="text-lg text-gray-600 mb-5 w-180 justify-center text-center">
        {isEditing?"Select the text you want to modify and click on the modify button.To modify images, select the image markdown (e.g., ![alt text](image_url)) and click modify.":"Enter your query below and get the notes generated for you."}
      </p>
      <SearchBar onSearch={handleSearch} />
      {loading && <div className="loader mt-2"></div>}

      {result.notes && (
        <div className="w-full max-w-4xl mt-8">
          <MarkdownDocument
            markdown={replaceMathDelimiters(result.notes)}
            onSave={handleSaveMarkdown}
            name={query}
            isLoading={loading}
            setLoading={setLoading}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(Page);
