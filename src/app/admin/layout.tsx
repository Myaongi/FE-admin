"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AdminHeader from "@/components/layout/AdminHeader";

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

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    // 사용자 정보 설정
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (e) {
      console.error("사용자 정보 파싱 오류:", e);
    }
  }, [router]);

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
      <main className="flex-1 flex flex-col bg-gray-100 transition-all duration-300 min-w-0">
        {/* Header */}
        <AdminHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
