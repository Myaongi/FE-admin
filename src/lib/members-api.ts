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

export interface Member {
  id: number;
  nickname: string;
  email: string;
  joinedAt: number[];
  status: "ACTIVATED" | "UNACTIVATED";
}

export interface MembersResponse {
  content: Member[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  totalUsers: number;
}

// ============================================
// API 메서드
// ============================================

/**
 * 사용자 목록 조회
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function getMembers(
  params: {
    query?: string;
    page?: number;
    size?: number;
  },
  token?: string | null
): Promise<ApiResponse<MembersResponse>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.get("/api/admin/members", {
    params,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return response.data;
}

/**
 * 사용자 상세 조회
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function getMemberDetail(
  memberId: number,
  token?: string | null
): Promise<ApiResponse<any>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.get(`/api/admin/members/${memberId}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return response.data;
}

/**
 * 사용자 상태 변경
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function updateMemberStatus(
  memberId: number,
  status: "ACTIVATED" | "UNACTIVATED",
  token?: string | null
): Promise<ApiResponse<any>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.patch(
    `/api/admin/members/${memberId}/status`,
    { status },
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );

  return response.data;
}

/**
 * 사용자 삭제
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function deleteMember(
  memberId: number,
  token?: string | null
): Promise<ApiResponse<string>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.delete(`/api/admin/members/${memberId}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return response.data;
}
