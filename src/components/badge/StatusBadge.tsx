"use client";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusMap: Record<string, { text: string; className: string }> = {
    실종: {
      text: "실종",
      className: "bg-pink-100 text-gray-600 border border-pink-300",
    },
    발견: {
      text: "발견",
      className: "bg-yellow-100 text-gray-600 border border-yellow-400",
    },
    "귀가 완료": {
      text: "귀가 완료",
      className: "bg-blue-100 text-gray-600 border border-blue-300",
    },
  };

  const statusInfo = statusMap[status] || {
    text: status,
    className: "bg-pink-100 text-gray-600 border border-pink-300",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-center tracking-normal leading-4 ${statusInfo.className}`}
    >
      {statusInfo.text}
    </span>
  );
}
