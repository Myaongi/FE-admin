"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        // 로그인되어 있으면 /admin으로 리다이렉트
        router.push("/admin");
        return;
      } else {
        // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
        router.push("/login");
        return;
      }
    };

    checkAuth();
  }, [router]);

  // 로딩 화면 표시
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-8 h-8 bg-sky-300 rounded-lg mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          강아지킴이 관리자
        </h2>
        <p className="text-sm text-gray-600">페이지를 확인하는 중...</p>
      </div>
    </div>
  );
}
