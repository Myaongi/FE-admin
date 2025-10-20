import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);

    // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
    const authHeader = request.headers.get("authorization");
    if (!authHeader && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 실제 DB에서는 soft delete 처리
    // 목업에서는 deletedAt만 반환
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
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    return NextResponse.json(
      { error: "게시글 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
