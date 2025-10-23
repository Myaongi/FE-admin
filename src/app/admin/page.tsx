"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // members 페이지로 리다이렉트
    router.push("/admin/members");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-8 h-8 bg-sky-300 rounded-lg mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          강아지킴이 관리자
        </h2>
        <p className="text-sm text-gray-600">사용자 관리 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
