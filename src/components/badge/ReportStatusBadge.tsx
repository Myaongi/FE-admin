// src/components/common/StatusBadge.tsx
import React from "react";

interface ReportStatusBadgeProps {
  status: string;
}

export default function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const statusMap: Record<string, { text: string; className: string }> = {
    "대기 중": {
      text: "대기 중",
      className: "bg-red-100 text-red-700 border border-red-300",
    },
    처리완료: {
      text: "처리완료",
      className: "bg-green-100 text-green-700 border border-green-300",
    },
    삭제됨: {
      text: "삭제됨",
      className: "bg-gray-200 text-gray-600 border border-gray-300",
    },
    무시됨: {
      text: "무시됨",
      className: "bg-gray-100 text-gray-600 border border-gray-300",
    },
  };

  const info =
    statusMap[status] ||
    ({
      text: status,
      className: "bg-gray-100 text-gray-600 border border-gray-300",
    } as const);

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-center tracking-normal leading-4 ${info.className}`}
    >
      {info.text}
    </span>
  );
}
