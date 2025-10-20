"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("test1@test.com");
  const [password, setPassword] = useState("password1@");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🚀 로그인 시도:", email);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("📦 로그인 응답:", data);
      console.log("🔍 응답 분석:", {
        isSuccess: data.isSuccess,
        code: data.code,
        message: data.message,
        hasAccessToken: !!data.result?.accessToken,
        userId: data.result?.userId,
        memberName: data.result?.memberName,
      });

      if (data.isSuccess) {
        // 서버 응답 형식에 따라 토큰과 사용자 정보 추출
        const token = data.result?.accessToken;
        const userId = data.result?.userId;
        const memberName = data.result?.memberName;

        if (token) {
          // 토큰을 localStorage에 저장
          localStorage.setItem("accessToken", token);

          // 사용자 정보 저장
          const userInfo = {
            userId: userId,
            name: memberName,
            email: email,
            role: "admin",
          };
          localStorage.setItem("user", JSON.stringify(userInfo));

          console.log(
            "✅ 로그인 성공, 토큰 저장됨:",
            token.substring(0, 20) + "..."
          );
          console.log("👤 사용자 정보:", userInfo);

          // 메인 페이지로 리다이렉트
          router.push("/");
        } else {
          setError("토큰을 받지 못했습니다. 서버 응답을 확인해주세요.");
        }
      } else {
        setError(data.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <div className="mx-auto h-12 w-12 bg-sky-300 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">강</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            강아지킴이 관리자
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            관리자 계정으로 로그인하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>테스트 계정:</p>
            <p className="font-mono">test1@test.com / password1@</p>
          </div>
        </form>
      </div>
    </div>
  );
}
