"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import { login } from "@/lib/auth-api";
import { getMembers } from "@/lib/members-api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@mail.com");
  const [password, setPassword] = useState("adminadmin123!");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 이미 로그인되어 있고 토큰이 유효한지 확인
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        setIsCheckingAuth(false);
        return;
      }

      // 토큰이 있으면 유효성 확인
      try {
        await getMembers({ page: 0, size: 1 }, token);
        // 토큰이 유효하면 어드민 페이지로 리다이렉트
        router.push("/admin/members");
      } catch (error: any) {
        // 토큰이 유효하지 않으면 로그인 화면 유지
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(email, password);

      if (!response.isSuccess || !response.result) {
        throw new Error(
          response.error || response.message || "로그인에 실패했습니다."
        );
      }

      const data = response.result;
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;

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
        userId: data.userId,
        name: data.memberName,
        email,
        role: "admin",
      };
      localStorage.setItem("user", JSON.stringify(userInfo));

      console.log("✅ 로그인 성공, 토큰 저장 완료");
      router.push("/admin/members");
    } catch (err: any) {
      console.error("❌ 로그인 오류:", err);

      // 에러 처리
      let errorMessage = "로그인에 실패했습니다.";
      if (err?.response) {
        // axios 에러 - 서버가 응답했지만 상태 코드가 2xx가 아닌 경우
        errorMessage =
          err.response.data?.error ||
          err.response.data?.message ||
          `로그인 실패 (status: ${err.response.status})`;
      } else if (err?.request) {
        // axios 에러 - 요청은 보냈지만 응답을 받지 못한 경우
        errorMessage = "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
      } else if (err?.message) {
        // 일반 에러
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // 인증 확인 중이면 로딩 화면 표시
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
