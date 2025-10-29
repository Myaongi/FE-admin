import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api-client";

// CORS preflight 요청 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string; reportId: string }> }
) {
  try {
    const { type, reportId } = await context.params;

    console.log("🔍 신고 상세 조회 API 호출:", type, reportId);

    // Authorization 헤더 확인
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
              "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // 실제 서버 API 호출
    const apiClient = getApiClient();
    const token = authHeader.replace("Bearer ", "");

    const response = await apiClient.getReportDetail(
      type,
      parseInt(reportId),
      token
    );

    console.log("✅ 신고 상세 조회 응답:", response);

    if (response.isSuccess) {
      return NextResponse.json(
        {
          isSuccess: true,
          result: response.result,
          message: "SUCCESS!",
          code: "COMMON200",
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
              "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    } else {
      return NextResponse.json(
        {
          isSuccess: false,
          error: response.error || "신고 상세 조회에 실패했습니다.",
          message: response.message,
          code: response.code,
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
              "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }
  } catch (error: any) {
    console.error("❌ 신고 상세 조회 실패:", error);

    return NextResponse.json(
      {
        isSuccess: false,
        error: error.message || "서버 오류가 발생했습니다.",
        message: "신고 상세 조회 실패",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}
