import { getApiClient } from "./api-client";

// ============================================
// 타입 정의
// ============================================

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  code?: string;
  message?: string;
  result?: T;
  error?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  userId?: number;
  memberName?: string;
}

// ============================================
// API 메서드
// ============================================

/**
 * 로그인
 * @param email - 이메일
 * @param password - 비밀번호
 */
export async function login(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  const apiClient = getApiClient();
  const response = await apiClient.post("/api/auth/login", {
    email,
    password,
  });

  return response.data;
}
