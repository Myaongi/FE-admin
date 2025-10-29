"use client";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  // status 값을 정규화 (공백 제거)
  const normalizedStatus = status?.trim() || "";

  // 한글, 영문 등 다양한 형식 지원
  const statusMap: Record<string, { text: string; className: string }> = {
    // 한글
    실종: {
      text: "실종",
      className: "bg-pink-100 text-gray-600 border border-pink-300",
    },
    발견: {
      text: "발견",
      className: "bg-yellow-100 text-gray-600 border border-yellow-400",
    },
    목격: {
      text: "발견",
      className: "bg-yellow-100 text-gray-600 border border-yellow-400",
    },
    "귀가 완료": {
      text: "귀가 완료",
      className: "bg-blue-100 text-gray-600 border border-blue-300",
    },
    // '귀가완료' (공백 없음) 추가
    귀가완료: {
      text: "귀가 완료",
      className: "bg-blue-100 text-gray-600 border border-blue-300",
    },
    // 영문 대문자
    LOST: {
      text: "실종",
      className: "bg-pink-100 text-gray-600 border border-pink-300",
    },
    FOUND: {
      text: "발견",
      className: "bg-yellow-100 text-gray-600 border border-yellow-400",
    },
    RETURNED: {
      text: "귀가 완료",
      className: "bg-blue-100 text-gray-600 border border-blue-300",
    },
    COMPLETED: {
      text: "귀가 완료",
      className: "bg-blue-100 text-gray-600 border border-blue-300",
    },
    // 영문 소문자
    lost: {
      text: "실종",
      className: "bg-pink-100 text-gray-600 border border-pink-300",
    },
    found: {
      text: "발견",
      className: "bg-yellow-100 text-gray-600 border border-yellow-400",
    },
    returned: {
      text: "귀가 완료",
      className: "bg-blue-100 text-gray-600 border border-blue-300",
    },
    completed: {
      text: "귀가 완료",
      className: "bg-blue-100 text-gray-600 border border-blue-300",
    },
  };

  const statusInfo = statusMap[normalizedStatus] || {
    text: status || "알 수 없음",
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
