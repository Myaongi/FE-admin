"use client";

interface AiToggleProps {
  aiOnly: boolean;
  onToggle: () => void;
}

export default function AiToggle({ aiOnly, onToggle }: AiToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${
          aiOnly ? "bg-sky-300" : "bg-gray-300"
        }`}
        onClick={onToggle}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-200 ${
            aiOnly ? "translate-x-4" : "translate-x-0"
          }`}
        ></div>
      </div>
      <span className="text-sm font-medium text-gray-900 tracking-tight leading-5">
        AI 이미지 생성 게시물만 보기
      </span>
    </div>
  );
}
