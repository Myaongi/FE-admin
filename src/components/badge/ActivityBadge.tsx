"use client";

interface ActivityBadgeProps {
  status: "ACTIVATED" | "UNACTIVATED";
}

export default function ActivityBadge({ status }: ActivityBadgeProps) {
  const isActive = status === "ACTIVATED";

  const badgeConfig = isActive
    ? {
        text: "활성",
        className: "bg-blue-100 text-blue-800 border border-blue-300",
      }
    : {
        text: "비활성",
        className: "bg-red-100 text-red-800 border border-red-300",
      };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-center tracking-normal leading-4 ${badgeConfig.className}`}
    >
      {badgeConfig.text}
    </span>
  );
}
