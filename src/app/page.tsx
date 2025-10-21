"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("posts"); // 기본값은 게시물 관리

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuSelect = (menu: string) => {
    setSelectedMenu(menu);
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

    // 초기 로드 시 체크
    handleResize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", handleResize);

    // 클린업
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex min-h-screen transition-all duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        selectedMenu={selectedMenu}
        onMenuSelect={handleMenuSelect}
      />
      <MainContent
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        selectedMenu={selectedMenu}
      />
    </div>
  );
}
