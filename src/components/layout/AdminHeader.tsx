"use client";

import Image from "next/image";
import logo from "@/assets/logo.svg";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export default function AdminHeader({
  sidebarOpen,
  onToggleSidebar,
  user,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="bg-white/60 border-b border-black/10 px-6 py-4 h-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                d="M12.6667 2H3.33333C2.59695 2 2 2.59695 2 3.33333V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V3.33333C14 2.59695 13.403 2 12.6667 2Z"
                stroke="currentColor"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 2V14"
                stroke="currentColor"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image src={logo} alt="강아지킴이 로고" width={120} height={120} />
          </button>
        </div>

        {/* 사용자 정보 및 로그아웃 */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user.name}</span>
              <span className="text-gray-400 ml-2">({user.email})</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
