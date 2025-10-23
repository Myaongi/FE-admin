"use client";

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
            className="w-7 h-7 border-none bg-none cursor-pointer rounded-lg flex items-center justify-center"
            onClick={onToggleSidebar}
          >
            <div className="w-4 h-4 bg-gray-600 relative transition-all duration-200">
              <div className="absolute top-1 left-0 w-full h-0.5 bg-white transition-all duration-200"></div>
              <div className="absolute bottom-1 left-0 w-full h-0.5 bg-white transition-all duration-200"></div>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-sky-300 rounded-lg"></div>
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight leading-7">
              강아지킴이 관리자
            </h2>
          </div>
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
