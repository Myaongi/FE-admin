// API 클라이언트 설정
const API_BASE_URL = "http://54.180.54.51:8080";

export interface ApiResponse<T> {
  success?: boolean;
  isSuccess?: boolean;
  result?: T;
  error?: string;
}

export interface Post {
  postId: number;
  type: "LOST" | "FOUND";
  status: string;
  title: string;
  authorName: string;
  createdAt: number[];
  region: string;
  isAiGenerated: boolean;
  aiImage?: string | null;
  realImages?: string[];
  dogName?: string;
  breed?: string;
  color?: string;
  gender?: string;
  description?: string;
  eventDateTime?: number[];
  latitude?: number;
  longitude?: number;
}

export interface PostDetail extends Post {
  // 상세 정보에만 있는 추가 필드들
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

    console.log(`🚀 API 요청: ${options.method || "GET"} ${url}`);

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
    };

    console.log(`📋 요청 옵션:`, {
      method: config.method || "GET",
      headers: config.headers,
      body: config.body ? "있음" : "없음",
    });

    try {
      const response = await fetch(url, config);

      console.log(`📡 응답 상태: ${response.status} ${response.statusText}`);

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
        return {
          isSuccess: true,
          result: data.result,
          message: data.message,
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
      console.error(`API 요청 실패 (${endpoint}):`, error);
      console.log(`📋 실패한 요청 정보:`, {
        url: url,
        method: config.method || "GET",
        headers: config.headers,
        body: config.body ? "있음" : "없음",
      });

      if (error instanceof Error) {
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

    // 가능한 엔드포인트들을 시도
    const possibleEndpoints = [
      `/api/admin/posts${queryString ? `?${queryString}` : ""}`,
      `/api/posts${queryString ? `?${queryString}` : ""}`,
      `/posts${queryString ? `?${queryString}` : ""}`,
      `/admin/posts${queryString ? `?${queryString}` : ""}`,
    ];

    let lastError;

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🔍 엔드포인트 시도: ${endpoint}`);

        const response = await this.request<PostsResponse>(
          endpoint,
          {
            method: "GET",
          },
          accessToken
        );

        console.log(`✅ 성공한 엔드포인트: ${endpoint}`);
        return response;
      } catch (error) {
        console.log(`❌ 엔드포인트 실패: ${endpoint}`);

        console.log(`📋 실패한 요청 헤더:`, {
          url: `${this.baseURL}${endpoint}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && {
              Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
            }),
          },
        });
        console.log(`🔍 에러 상세:`, error);
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error("모든 엔드포인트 시도 실패");
  }

  // 게시글 상세 조회
  async getPostDetail(
    postId: number,
    accessToken?: string
  ): Promise<ApiResponse<PostDetail>> {
    const possibleEndpoints = [
      `/api/admin/posts/${postId}`,
      `/api/posts/${postId}`,
      `/posts/${postId}`,
      `/admin/posts/${postId}`,
      `/api/admin/post/${postId}`,
      `/api/post/${postId}`,
      `/post/${postId}`,
    ];

    let lastError;

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🔍 상세 조회 엔드포인트 시도: ${endpoint}`);

        const response = await this.request<PostDetail>(
          endpoint,
          {
            method: "GET",
          },
          accessToken
        );

        console.log(`✅ 성공한 상세 조회 엔드포인트: ${endpoint}`);
        return response;
      } catch (error) {
        console.log(`❌ 상세 조회 엔드포인트 실패: ${endpoint}`);

        console.log(`📋 실패한 요청 헤더:`, {
          url: `${this.baseURL}${endpoint}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && {
              Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
            }),
          },
        });
        console.log(`🔍 에러 상세:`, error);
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error("모든 상세 조회 엔드포인트 시도 실패");
  }

  // 게시글 삭제
  async deletePost(
    postId: number,
    accessToken?: string
  ): Promise<ApiResponse<DeleteResponse>> {
    const possibleEndpoints = [
      `/api/admin/posts/${postId}/delete`,
      `/api/posts/${postId}/delete`,
      `/posts/${postId}/delete`,
      `/admin/posts/${postId}/delete`,
    ];

    let lastError;

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🔍 삭제 엔드포인트 시도: ${endpoint}`);

        const response = await this.request<DeleteResponse>(
          endpoint,
          {
            method: "PATCH",
          },
          accessToken
        );

        console.log(`✅ 성공한 삭제 엔드포인트: ${endpoint}`);
        return response;
      } catch (error) {
        console.log(`❌ 삭제 엔드포인트 실패: ${endpoint}`);

        console.log(`📋 실패한 요청 헤더:`, {
          url: `${this.baseURL}${endpoint}`,
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && {
              Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
            }),
          },
        });
        console.log(`🔍 에러 상세:`, error);
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error("모든 삭제 엔드포인트 시도 실패");
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient(API_BASE_URL);

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
