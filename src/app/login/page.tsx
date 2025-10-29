"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/logo.svg";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@mail.com");
  const [password, setPassword] = useState("adminadmin123!");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = `로그인 실패 (status: ${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();

      const accessToken = data?.result?.accessToken;
      const refreshToken = data?.result?.refreshToken;

      if (!accessToken) {
        throw new Error("응답에 accessToken이 없습니다.");
      }

      // ✅ 기존 토큰 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // ✅ 새 토큰 저장
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // ✅ 디버깅 로그
      console.log("✅ 새 토큰 저장 완료:", {
        accessToken: accessToken?.substring(0, 20) + "...",
        refreshToken: refreshToken?.substring(0, 20) + "...",
      });

      // ✅ 사용자 정보 저장 (선택)
      const userInfo = {
        userId: data?.result?.userId,
        name: data?.result?.memberName,
        email,
        role: "admin",
      };
      localStorage.setItem("user", JSON.stringify(userInfo));

      console.log("✅ 로그인 성공, 토큰 저장 완료");
      router.push("/admin/members");
    } catch (err: any) {
      console.error("❌ 로그인 오류:", err);
      setError(err?.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <div className="flex justify-center mb-4">
          <Image src={logo} alt="강아지킴이 로고" width={220} height={220} />
        </div>
        <h1 className="text-base text-center font-semibold mb-6">
          🔐 관리자 페이지에 로그인해주세요
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="이메일을 입력하세요."
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="비밀번호를 입력하세요."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-sky-400 hover:bg-sky-500 text-white text-lg font-bold rounded-2xl shadow-md transition-colors"
          >
            로그인
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">{error}</div>
        )}
      </div>
    </div>
  );
}
