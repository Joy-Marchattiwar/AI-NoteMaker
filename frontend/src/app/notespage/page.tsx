"use client";
import React, { useState } from "react";
import SearchBar from "@/components/ui/searchbar";
import axios from "axios";
import "./styles.css";
import res from "./temp.json";
import EditableDocument from "@/components/EditableDocument";

const Page = () => {
  const [result, setResults] = useState<{
    message: string;
    notes: (string | string[])[];
  }>({
    message: "",
    notes: [],
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (query: string) => {
    if (!query) return;
    try {
      setLoading(true);
      // Uncomment this when your API is ready
      // const response = await axios.post(
      //   `http://127.0.0.1:8000/generate_note/`,
      //   {
      //     params: { query: query },
      //   },
      // );
      // console.log(response.data);
      // setResults(response.data["notes"]);
      setResults(res);
      console.log(result.notes);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSaveNotes = (updatedNotes: (string | string[])[]) => {
    setResults((prev) => ({
      ...prev,
      notes: updatedNotes,
    }));

    // Here you could also send the updated notes to your API
    // to save them permanently
    console.log("Notes updated:", updatedNotes);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mt-12">Build Notes</h1>
      <SearchBar onSearch={handleSearch} />
      {loading && <div className="loader"></div>}

      {result.notes && result.notes.length > 0 && (
        <div className="w-full max-w-4xl mt-8">
          <EditableDocument notes={result.notes} onSave={handleSaveNotes} />
        </div>
      )}
    </div>
  );
};

export default Page;
