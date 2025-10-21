"use client";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  className?: string;
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onSizeChange,
  className = "",
}: TablePaginationProps) {
  const startElement = currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(0, currentPage - 2);
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          {totalElements > 0 ? `${startElement}-${endElement}` : 0} /{" "}
          {totalElements}개
        </span>
        {onSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={10}>10개씩</option>
            <option value={20}>20개씩</option>
            <option value={50}>50개씩</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          처음
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          이전
        </button>

        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-1 text-sm border rounded ${
              currentPage === pageNum
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {pageNum + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          다음
        </button>

        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          마지막
        </button>
      </div>
    </div>
  );
}
