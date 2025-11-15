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

export interface Report {
  reportId: number;
  type: "LOST" | "FOUND";
  reason: string;
  reporterName: string;
  reportedAt: number[];
  targetPostId: number;
  targetTitle: string;
  status: string;
}

export interface ReportDetail extends Report {
  targetContent?: string;
  imagePreview?: string | null;
  realImages?: string[];
  detailReason?: string;
}

export interface ReportsResponse {
  content: Report[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ============================================
// API 메서드
// ============================================

/**
 * 신고 내역 목록 조회
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function getReports(
  params: {
    page?: number;
    size?: number;
  },
  token?: string | null
): Promise<ApiResponse<ReportsResponse>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.get("/api/admin/reports", {
    params,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return response.data;
}

/**
 * 신고 상세 조회
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function getReportDetail(
  type: "LOST" | "FOUND",
  reportId: number,
  token?: string | null
): Promise<ApiResponse<ReportDetail>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.get(
    `/api/admin/reports/${type}/${reportId}`,
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );

  return response.data;
}

/**
 * 신고 무시 처리
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function ignoreReport(
  type: "LOST" | "FOUND",
  reportId: number,
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
    `/api/admin/reports/${type}/${reportId}/ignore`,
    {},
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );

  return response.data;
}

/**
 * 신고된 게시물 삭제
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function deleteReportedPost(
  type: "LOST" | "FOUND",
  reportId: number,
  token?: string | null
): Promise<ApiResponse<any>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.delete(
    `/api/admin/reports/${type}/${reportId}/delete`,
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );

  return response.data;
}
