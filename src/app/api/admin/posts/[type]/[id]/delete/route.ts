import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api-client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const postId = parseInt(params.id);
    const postType = params.type as "LOST" | "FOUND";

    // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
    const authHeader = request.headers.get("authorization");
    if (!authHeader && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 환경 변수로 목업 데이터 사용 여부 결정
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === "true";

    if (useMockData) {
      // 목업 데이터 사용 - 실제 DB에서는 soft delete 처리
      const deletedAt = new Date();

      const response = {
        isSuccess: true,
        result: {
          postId,
          isDeleted: true,
          deletedAt: deletedAt.toISOString(),
        },
      };

      console.log("게시글 삭제 처리:", response);
      return NextResponse.json(response);
    } else {
      // 실제 서버 API 호출
      const apiClient = getApiClient();

      // Authorization 헤더에서 토큰 추출
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "") || "";

      const response = await apiClient.deletePost(postId, postType, token);

      if (response.success || response.isSuccess) {
        return NextResponse.json(response);
      } else {
        return NextResponse.json(
          { error: response.error || "게시글 삭제에 실패했습니다." },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("게시글 삭제 오류:", error);

    // 서버에서 온 상태 코드가 있으면 그대로 사용
    if (error && typeof error === "object" && "status" in error) {
      const status = (error as any).status;
      const statusText = (error as any).statusText || "Server Error";

      console.log(`🔍 서버 상태 코드 전달: ${status} ${statusText}`);

      return NextResponse.json(
        { error: (error as any).message || "게시글 삭제에 실패했습니다." },
        { status: status }
      );
    }

    // 에러 타입에 따른 적절한 응답
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { error: "인증이 필요합니다." },
          { status: 401 }
        );
      } else if (error.message.includes("404")) {
        return NextResponse.json(
          { error: "게시글을 찾을 수 없습니다." },
          { status: 404 }
        );
      } else if (error.message.includes("네트워크")) {
        return NextResponse.json(
          { error: "서버에 연결할 수 없습니다. 네트워크를 확인해주세요." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "게시글 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
