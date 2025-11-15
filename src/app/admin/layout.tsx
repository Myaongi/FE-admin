"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { getMembers } from "@/lib/members-api";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("posts");
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 사이드바 토글
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 메뉴 선택 핸들러
  const handleMenuSelect = (menu: string) => {
    if (menu === "users") {
      router.push("/admin/members");
    } else if (menu === "posts") {
      router.push("/admin/posts");
    } else if (menu === "reports") {
      router.push("/admin/reports");
    } else {
      setSelectedMenu(menu);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // 모바일에서 사이드바 자동 닫힘
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // URL에 따라 selectedMenu 설정
  useEffect(() => {
    if (pathname.includes("/admin/members")) {
      setSelectedMenu("users");
    } else if (pathname.includes("/admin/posts")) {
      setSelectedMenu("posts");
    } else if (pathname.includes("/admin/reports")) {
      setSelectedMenu("reports");
    }
  }, [pathname]);

  // 로그인 상태 및 토큰 유효성 확인
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      // 토큰이나 사용자 정보가 없으면 로그인 페이지로
      if (!token || !userData) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      // 사용자 정보 설정
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error("사용자 정보 파싱 오류:", e);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      // 토큰 유효성 검증 - 실제 API 호출로 확인
      try {
        // 간단한 API 호출로 토큰이 유효한지 확인
        await getMembers({ page: 0, size: 1 }, token);
        // 토큰이 유효하면 정상적으로 진행
        setIsCheckingAuth(false);
      } catch (error: any) {
        console.error("토큰 유효성 검증 실패:", error);

        // 401 에러이거나 네트워크 오류인 경우 로그인 페이지로
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          router.push("/login");
        } else {
          // 다른 에러의 경우 일단 진행 (네트워크 오류일 수도 있음)
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();
  }, [router]);

  // 인증 확인 중이면 로딩 화면 표시
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            강아지킴이 관리자
          </h2>
          <p className="text-sm text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen transition-all duration-300">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        selectedMenu={selectedMenu}
        onMenuSelect={handleMenuSelect}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-100 transition-all duration-300 min-w-[480px] overflow-hidden">
        {/* Header */}
        <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
          <AdminHeader
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
