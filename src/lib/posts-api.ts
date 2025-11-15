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

export interface Post {
  postId: number;
  type: "LOST" | "FOUND";
  status: string;
  thumbnailUrl: string;
  title: string;
  authorName: string;
  createdAt: number[];
  region: string;
  aiImage?: string | null;
  realImages?: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface PostDetail extends Post {
  dogName?: string | null;
  breed: string;
  color: string;
  gender: "MALE" | "FEMALE";
  description: string;
  eventDateTime: number[];
  latitude: number;
  longitude: number;
}

export interface PostsResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ============================================
// API 메서드
// ============================================

/**
 * 게시물 목록 조회
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function getPosts(
  params: {
    type?: "ALL" | "LOST" | "FOUND";
    aiOnly?: boolean;
    page?: number;
    size?: number;
  },
  token?: string | null
): Promise<ApiResponse<PostsResponse>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.get("/api/admin/posts", {
    params,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return response.data;
}

/**
 * 게시물 상세 조회
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function getPostDetail(
  type: "LOST" | "FOUND",
  postId: number,
  token?: string | null
): Promise<ApiResponse<PostDetail>> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.get(`/api/admin/posts/${type}/${postId}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return response.data;
}

/**
 * 게시물 삭제 (Soft Delete)
 * @param token - 서버 사이드에서 사용할 경우 token을 전달 (클라이언트 사이드에서는 생략 가능)
 */
export async function deletePost(
  type: "LOST" | "FOUND",
  postId: number,
  token?: string | null
): Promise<
  ApiResponse<{ postId: number; isDeleted: boolean; deletedAt: string }>
> {
  const accessToken =
    token !== undefined
      ? token
      : typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const apiClient = getApiClient();
  const response = await apiClient.delete(
    `/api/admin/posts/${type}/${postId}`,
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );

  return response.data;
}
