"use client"
import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void; // Callback function to return the search value
}

const SearchBar: React.FC<SearchBarProps> = React.memo(({ onSearch }) => {
  const [query, setQuery] = useState<string>("");

  const handleSearch = (event: React.FormEvent) => {
    console.log(query)
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </form>
  );
});

export default SearchBar;
