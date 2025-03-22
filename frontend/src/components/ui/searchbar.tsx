"use client"
import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void; // Callback function to return the search value
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState<string>("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(query); // Send search query to parent component
  };

  return (
    <form
      className="flex items-center w-80 border-2 border-gray-300 rounded-full overflow-hidden transition-all duration-300 focus-within:border-blue-500"
      onSubmit={handleSearch}
    >
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 p-3 text-lg outline-none"
      />
      <button
        type="submit"
        className="p-3 text-lg hover:scale-110 transition-transform duration-200"
      >
        🔍
      </button>
    </form>
  );
};

export default SearchBar;
