// API 클라이언트 설정
const API_BASE_URL = "http://54.180.54.51:8080"; // ✅ 백엔드 서버로 직접 요청"; // Next.js API 라우트를 통한 상대 경로
const MOCK_API_BASE_URL = "/api"; // 목업 데이터 (사용자 관리용)

// 공통 설정
const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export interface ApiResponse<T> {
  success?: boolean;
  isSuccess?: boolean;
  result?: T;
  error?: string;
  message?: string;
  code?: string;
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
  isAiGenerated: boolean;
  aiImage: string | null;
  realImages: string[];
  dogName?: string | null;
  breed?: string;
  color?: string;
  gender?: string;
  description?: string;
  eventDateTime?: number[];
  latitude?: number;
  longitude?: number;
}

export interface PostDetail extends Post {
  dogName?: string | null; // LOST만 값 존재
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
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export interface DeleteResponse {
  postId: number;
  isDeleted: boolean;
  deletedAt: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // 🔹 요청 직전 디버깅 로그
    console.groupCollapsed(`🚀 API 요청 디버깅: ${endpoint}`);
    console.log("✅ 최종 요청 URL:", url);
    console.log("📦 baseURL:", this.baseURL);
    console.log("🧩 endpoint:", endpoint);
    console.log("🧭 전체 요청 URL:", `${this.baseURL}${endpoint}`);
    console.log(
      "🔑 Authorization 헤더:",
      accessToken ? accessToken.substring(0, 30) + "..." : "없음"
    );
    console.groupEnd();

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (accessToken) {
      defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
      console.log(
        `🔑 외부 서버에 토큰 전달: ${accessToken.substring(0, 20)}...`
      );
    } else {
      console.log(`⚠️ 토큰이 없어서 외부 서버에 인증 헤더 없이 요청`);
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // CORS 문제 해결을 위한 설정 추가
      mode: "cors",
      credentials: "omit",
    };

    console.log(`📋 Headers:`, config.headers);

    try {
      // 네트워크 연결 확인 (클라이언트에서만)
      if (typeof window !== "undefined" && !navigator.onLine) {
        throw new Error(
          "네트워크 연결이 없습니다. 인터넷 연결을 확인해주세요."
        );
      }

      // 타임아웃 설정 (30초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 🔹 응답 직후 디버깅 로그
      console.groupCollapsed("📡 API 응답 디버깅");
      console.log("🔢 상태 코드:", response.status, response.statusText);
      console.log("🗂️ 응답 URL:", response.url);
      try {
        const textPreview = await response.clone().text();
        console.log(
          "📄 응답 미리보기 (앞부분 300자):",
          textPreview.slice(0, 300)
        );
      } catch (e) {
        console.warn("⚠️ 응답 본문 미리보기 실패:", e);
      }
      console.groupEnd();

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ 서버 오류 응답 원문:`, errorText);
        console.log(`❌ 응답 상태:`, response.status, response.statusText);

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText);
          console.log(`❌ 파싱된 오류 데이터:`, errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          console.log(`❌ JSON 파싱 실패, 원문 사용:`, errorText);
          // JSON 파싱 실패 시 기본 에러 메시지 사용
        }

        console.error(`❌ API 오류: ${errorMessage}`);

        // 상태 코드를 포함한 에러 객체 생성
        const error = new Error(errorMessage) as any;
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }

      const data = await response.json();
      console.log(`✅ API 응답 성공:`, data);

      // 서버 응답 형식에 맞게 변환
      if (data.isSuccess) {
        // 서버에서 result 안에 실제 데이터(content, totalElements 등)가 들어 있으므로
        const resultData = data.result?.content
          ? data.result
          : { content: data.result };

        return {
          success: true,
          isSuccess: true,
          result: resultData,
          message: "OK", // ✅ 항상 OK로 통일 (SUCCESS! 때문에 throw 방지)
          code: data.code,
        };
      } else {
        return {
          isSuccess: false,
          error: data.message || data.error || "알 수 없는 오류",
          message: data.message,
          code: data.code,
        };
      }
    } catch (error) {
      // 🔹 오류 발생 시 디버깅 로그
      console.error("❌ API 요청 중 예외 발생:", error);
      console.log("❌ 실패 요청 URL:", url);
      console.log("❌ HTTP 메서드:", config.method);
      console.log("❌ 요청 헤더:", config.headers);
      console.log("❌ body 유무:", config.body ? "있음" : "없음");

      // 더 구체적인 에러 메시지 제공
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.error("❌ 네트워크 오류 또는 CORS 문제 발생");
        throw new Error(
          "서버에 연결할 수 없습니다. 네트워크 연결을 확인하거나 서버 상태를 확인해주세요."
        );
      }

      if (error instanceof Error) {
        // AbortError는 타임아웃을 의미
        if (error.name === "AbortError") {
          throw new Error(
            "요청 시간이 초과되었습니다. 서버가 응답하지 않습니다."
          );
        }
        throw error;
      }

      throw new Error("네트워크 오류가 발생했습니다.");
    }
  }

  // 게시글 목록 조회
  async getPosts(
    params: {
      type?: string;
      aiOnly?: boolean;
      page?: number;
      size?: number;
    } = {},
    accessToken?: string
  ): Promise<ApiResponse<PostsResponse>> {
    const searchParams = new URLSearchParams();

    if (params.type) searchParams.append("type", params.type);
    if (params.aiOnly !== undefined)
      searchParams.append("aiOnly", params.aiOnly.toString());
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/admin/posts${queryString ? `?${queryString}` : ""}`;

    console.log(`🔍 게시글 목록 조회: ${endpoint}`);

    return await this.request<PostsResponse>(
      endpoint,
      {
        method: "GET",
      },
      accessToken
    );
  }

  // 게시글 상세 조회 - GET /api/admin/posts/{type}/{postId}
  async getPostDetail(
    postId: number,
    type: "LOST" | "FOUND",
    accessToken?: string
  ): Promise<ApiResponse<PostDetail>> {
    const endpoint = `/api/admin/posts/${type}/${postId}`;

    console.log(`🔍 게시글 상세 조회: ${endpoint}`);

    try {
      const response = await this.request<PostDetail>(
        endpoint,
        {
          method: "GET",
        },
        accessToken
      );

      // 게시글 상세 조회는 단일 객체를 반환하므로 content 배열 처리를 하지 않음
      if (response.isSuccess && response.result) {
        console.log("📋 게시글 상세 응답:", response.result);
        return {
          success: true,
          isSuccess: true,
          result: response.result,
          message: response.message,
          code: response.code,
        };
      } else {
        return response;
      }
    } catch (error) {
      console.error("게시글 상세 조회 오류:", error);
      throw error;
    }
  }

  // 게시글 삭제 - PATCH /api/admin/posts/{type}/{postId}/delete
  async deletePost(
    postId: number,
    type: "LOST" | "FOUND",
    accessToken?: string
  ): Promise<ApiResponse<DeleteResponse>> {
    const endpoint = `/api/admin/posts/${type}/${postId}/delete`;

    console.log(`🗑️ 게시글 삭제: ${endpoint}`);

    return await this.request<DeleteResponse>(
      endpoint,
      {
        method: "PATCH",
      },
      accessToken
    );
  }

  // 신고 내역 조회 - GET /api/admin/reports
  async getReports(
    page: number = 0,
    size: number = 20,
    accessToken?: string
  ): Promise<ApiResponse<any>> {
    const endpoint = `/api/admin/reports?page=${page}&size=${size}`;

    console.log(`🔥 Reports API 호출됨! ${endpoint}`);

    return await this.request<any>(
      endpoint,
      {
        method: "GET",
      },
      accessToken
    );
  }

  // 신고 무시 처리 - PATCH /api/admin/reports/{type}/{reportId}/ignore
  async ignoreReport(
    type: string,
    reportId: number,
    accessToken?: string
  ): Promise<ApiResponse<any>> {
    const endpoint = `/api/admin/reports/${type}/${reportId}/ignore`;

    console.log(`🩶 신고 무시 처리 API 호출: ${endpoint}`);

    return await this.request<any>(
      endpoint,
      {
        method: "PATCH",
      },
      accessToken
    );
  }

  // 신고 게시글 삭제 - DELETE /api/admin/reports/{type}/{reportId}/delete
  async deleteReport(
    type: string,
    reportId: number,
    accessToken?: string
  ): Promise<ApiResponse<any>> {
    const endpoint = `/api/admin/reports/${type}/${reportId}/delete`;

    console.log(`🧹 신고 게시글 삭제 API 호출: ${endpoint}`);

    return await this.request<any>(
      endpoint,
      {
        method: "DELETE",
      },
      accessToken
    );
  }

  // 신고 상세 조회 - GET /api/admin/reports/{type}/{reportId}
  async getReportDetail(
    type: string,
    reportId: number,
    accessToken?: string
  ): Promise<ApiResponse<any>> {
    const endpoint = `/api/admin/reports/${type}/${reportId}`;

    console.log(`🔍 신고 상세 조회 API 호출: ${endpoint}`);

    return await this.request<any>(
      endpoint,
      {
        method: "GET",
      },
      accessToken
    );
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient(API_BASE_URL); // 게시물 관리용 (실서버)
export const mockApiClient = new ApiClient(MOCK_API_BASE_URL); // 사용자 관리용 (목업)

// 개발 환경에서 목업 데이터를 사용할지 실제 서버를 사용할지 결정하는 함수
export const isUsingMockData = (): boolean => {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_USE_MOCK === "true"
  );
};

// 환경에 따라 적절한 API 클라이언트를 반환하는 함수
export const getApiClient = () => {
  if (isUsingMockData()) {
    // 목업 데이터 사용 시 로컬 API 사용
    return new ApiClient("");
  }
  return apiClient;
};

// 사용자 관리용 API 클라이언트 (항상 목업 데이터 사용)
export const getMembersApiClient = () => {
  return mockApiClient;
};
