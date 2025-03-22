"use client"
import React,{useState} from "react";
import SearchBar from "@/components/ui/searchbar";
import axios from "axios";
import "./styles.css"
const Page = () => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const handleSearch = async (query: string) => {
    if (!query) return; // Avoid empty searches

    try {
        setLoading(true);
    //   const response = await axios.get(`https://api.example.com/search`, {
    //     params: { q: query }, // Send query as a parameter
    //   });
    console.log("searching for:", query);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    //   setResults(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mt-12">Build Notes</h1>
      <SearchBar onSearch={handleSearch} />
    {loading && <div className="loader"></div>}
    </div>
  );
};
export default Page;