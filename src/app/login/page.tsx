"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("delicia.zure@gmail.com");
  const [password, setPassword] = useState("ghksl-091016");

  const [manualAccess, setManualAccess] = useState("");
  const [manualRefresh, setManualRefresh] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

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

      // ✅ 토큰 저장
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

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

  function handleManualSave() {
    setError(null);

    if (!manualAccess) {
      setError("accessToken을 입력하세요.");
      return;
    }

    // ✅ 토큰 수동 저장
    localStorage.setItem("accessToken", manualAccess);
    if (manualRefresh) {
      localStorage.setItem("refreshToken", manualRefresh);
    }

    console.log("✅ 수동 토큰 저장 완료");
    router.push("/admin/members");
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔐 로그인</h1>

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
          className="w-full py-2 rounded bg-blue-500 text-white font-medium"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">{error}</div>
      )}

      {/* 👇 토큰 수동 입력 섹션 */}
      <div className="mt-8">
        <button
          className="text-sm underline text-gray-600"
          onClick={() => setManualOpen((v) => !v)}
        >
          {manualOpen ? "수동 입력 닫기" : "토큰 수동 입력 (임시용)"}
        </button>

        {manualOpen && (
          <div className="mt-4 space-y-3 p-4 border rounded">
            <div>
              <label className="block text-sm mb-1">accessToken</label>
              <textarea
                value={manualAccess}
                onChange={(e) => setManualAccess(e.target.value)}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzYxMTYyODgzLCJleHAiOjE3NjExNjU4ODN9.M9q4Eg8JZv3W9aseT94wA7isIxFh1cqFZ_ZX3t7z9g4
"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">refreshToken (선택)</label>
              <textarea
                value={manualRefresh}
                onChange={(e) => setManualRefresh(e.target.value)}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzYxMTYyODgzLCJleHAiOjE3NjExNjU4ODN9.M9q4Eg8JZv3W9aseT94wA7isIxFh1cqFZ_ZX3t7z9g4"
              />
            </div>

            <button
              onClick={handleManualSave}
              className="w-full py-2 rounded bg-gray-800 text-white font-medium"
            >
              토큰 저장하고 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
