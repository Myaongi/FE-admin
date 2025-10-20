"use client";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 relative z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          isOpen ? "fixed lg:relative" : "fixed lg:relative"
        } top-0 left-0 h-screen lg:h-auto`}
      >
        <div className="p-4 border-b border-gray-200 h-24">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-sky-300 rounded-lg flex items-center justify-center"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-7">
                강아지킴이
              </h1>
              <p className="text-sm font-medium text-gray-500 tracking-tight leading-5">
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-2">
          <nav className="flex flex-col gap-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 mb-1">
              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
              <span className="text-sm font-medium text-gray-900 tracking-tight leading-5">
                데이터 분석 및 통계
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 mb-1">
              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
              <span className="text-sm font-medium text-gray-900 tracking-tight leading-5">
                사용자 관리
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors bg-gray-100 mb-1">
              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
              <span className="text-sm font-medium text-gray-900 tracking-tight leading-5">
                게시물 관리
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 mb-1">
              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
              <span className="text-sm font-medium text-gray-900 tracking-tight leading-5">
                신고 내역
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 mb-1">
              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
              <span className="text-sm font-medium text-gray-900 tracking-tight leading-5">
                AI 매칭
              </span>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
