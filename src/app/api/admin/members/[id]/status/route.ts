// src/app/api/admin/members/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateMemberStatus } from "@/lib/members-api";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const memberId = parseInt(id);
    const body = await request.json();
    const { status } = body;
    const authHeader = request.headers.get("authorization");

    // 실제 서버 API 호출 - members-api.ts 사용
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;
    const response = await updateMemberStatus(
      memberId,
      status as "ACTIVATED" | "UNACTIVATED",
      token
    );

    console.log("✅ 서버 응답:", response);

    return NextResponse.json(response, {
      status: response.isSuccess ? 200 : 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    console.error("❌ 계정 상태 변경 오류:", error);

    // axios 에러의 경우 외부 서버의 상태 코드를 그대로 전달
    const statusCode = error?.response?.status || 500;
    let errorMessage = "서버 요청에 실패했습니다.";

    if (error?.response?.data) {
      errorMessage =
        error.response.data.error ||
        error.response.data.message ||
        errorMessage;
    }

    return NextResponse.json(
      { error: errorMessage },
      {
        status: statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}
