"use client";

interface FilterButtonsProps {
  filter: "ALL" | "FOUND" | "LOST";
  onFilterChange: (filter: "ALL" | "FOUND" | "LOST") => void;
}

export default function FilterButtons({
  filter,
  onFilterChange,
}: FilterButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        className={`px-3 py-1.5 border rounded-full text-sm font-medium tracking-tight leading-5 cursor-pointer transition-all duration-200 ${
          filter === "ALL"
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-900 border-black/10 hover:bg-gray-50"
        }`}
        onClick={() => onFilterChange("ALL")}
      >
        전체
      </button>
      <button
        className={`px-3 py-1.5 border rounded-full text-sm font-medium tracking-tight leading-5 cursor-pointer transition-all duration-200 ${
          filter === "FOUND"
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-900 border-black/10 hover:bg-gray-50"
        }`}
        onClick={() => onFilterChange("FOUND")}
      >
        발견했어요
      </button>
      <button
        className={`px-3 py-1.5 border rounded-full text-sm font-medium tracking-tight leading-5 cursor-pointer transition-all duration-200 ${
          filter === "LOST"
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-900 border-black/10 hover:bg-gray-50"
        }`}
        onClick={() => onFilterChange("LOST")}
      >
        잃어버렸어요
      </button>
    </div>
  );
}
