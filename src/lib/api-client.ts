import axios, { AxiosInstance } from "axios";

let client: AxiosInstance | null = null;

/**
 * Axios 인스턴스 생성
 * - 클라이언트: baseURL 없음 (Next.js API Route 사용)
 * - 서버 (API Route): baseURL = 백엔드 서버 (직접 호출)
 */
export function getApiClient() {
  if (!client) {
    // 서버 사이드에서는 백엔드 직접 호출, 클라이언트에서는 상대 경로
    const baseURL =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://54.180.54.51:8080"
        : ""; // 클라이언트는 Next.js API Route 거침

    client = axios.create({
      baseURL,
      withCredentials: false,
    });
  }
  return client;
}

/**
 * 클라이언트 컴포넌트에서 바로 쓸 수 있는 기본 인스턴스
 * (굳이 getApiClient() 안 쓰고 싶은 곳용)
 */
export const apiClient = getApiClient();
