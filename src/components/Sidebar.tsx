"use client";

import Image from "next/image";
import logo from "@/assets/logo.svg";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  selectedMenu,
  onMenuSelect,
}: SidebarProps) {
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
        className={`transition-all duration-300 bg-white border-r border-gray-200 fixed lg:static top-0 left-0 h-screen z-40 overflow-hidden ${
          isOpen ? "w-60 opacity-100" : "w-0 opacity-0"
        }`}
      >
        {isOpen && (
          <div className="w-60 transition-opacity duration-300">
            <div className="p-4 border-b border-gray-200 h-20">
              <div className="flex items-center gap-2">
                <div className="mb-2">
                  <div className="flex justify-center mb-3">
                    <Image
                      src={logo}
                      alt="강아지킴이 로고"
                      width={120}
                      height={120}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-500 tracking-tight leading-3">
                    Admin Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-2">
              <nav className="flex flex-col gap-0">
                {/* <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 mb-1">
                <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                <span className="text-sm font-medium text-gray-900 tracking-tight leading-5">
                  데이터 분석 및 통계
                </span>
              </div> */}
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                    selectedMenu === "users"
                      ? "bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => onMenuSelect("users")}
                >
                  <span className="flex items-center gap-2">
                    <img
                      src="/userAdmin.svg"
                      alt="사용자 관리"
                      className="w-4 h-4"
                    />
                    사용자 관리
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                    selectedMenu === "posts"
                      ? "bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => onMenuSelect("posts")}
                >
                  <span className="flex items-center gap-2">
                    <img
                      src="/postAdmin.svg"
                      alt="게시물 관리"
                      className="w-4 h-4"
                    />
                    게시물 관리
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                    selectedMenu === "reports"
                      ? "bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => onMenuSelect("reports")}
                >
                  <span className="flex items-center gap-2">
                    <img
                      src="/reportAdmin.svg"
                      alt="신고 내역"
                      className="w-4 h-4"
                    />
                    신고 내역
                  </span>
                </div>
                {/* <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 mb-1">
                <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                <span className="text-sm font-medium text-gray-900 tracking-tight leading-5">
                  AI 매칭
                </span>
              </div> */}
              </nav>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
