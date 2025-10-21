"use client";

import { useState } from "react";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchFilter({
  value,
  onChange,
  onSearch,
  placeholder = "검색어를 입력하세요",
  className = "",
}: SearchFilterProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(value);
    }
  };

  const handleSearch = () => {
    onSearch(value);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-sky-400 text-white rounded-lg text-sm font-medium hover:bg-sky-500 transition-colors"
      >
        검색
      </button>
    </div>
  );
}
