"use client";

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
  className = "",
}: AdminTableProps<T>) {
  const getValue = (item: T, key: string) => {
    return key.split(".").reduce((obj, k) => obj?.[k], item);
  };

  return (
    <div
      className={`overflow-x-auto -webkit-overflow-scrolling-touch ${className}`}
    >
      <table className="table-auto min-w-max w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-transparent">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-2 lg:px-4 py-2 text-left text-sm font-medium text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5">
                로딩 중...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-5 text-red-500"
              >
                {error}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap"
                  >
                    {column.render
                      ? column.render(getValue(item, column.key), item)
                      : String(getValue(item, column.key) || "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
