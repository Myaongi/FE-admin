import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api-client";
import { getReports } from "@/lib/reports-api";

// CORS preflight 요청 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    // Authorization 헤더 확인
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    console.log(`🔥 신고 내역 API 호출: page=${page}, size=${size}`);

    // 실제 서버 API 호출 - reports-api.ts 사용
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;
    const response = await getReports({ page, size }, token);

    console.log("📦 신고 내역 API 응답:", response);

    if (response.isSuccess && response.result) {
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
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    } else {
      return NextResponse.json(
        {
          isSuccess: false,
          error: response.error || "신고 내역을 불러올 수 없습니다.",
          message: response.message,
          code: response.code,
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }
  } catch (error: any) {
    console.error("❌ 신고 내역 조회 실패:", error);

    // axios 에러의 경우 외부 서버의 상태 코드를 그대로 전달
    const statusCode = error?.response?.status || 500;
    let errorMessage = "서버 오류가 발생했습니다.";

    if (error?.response?.data) {
      errorMessage = error.response.data.error || error.response.data.message || errorMessage;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        isSuccess: false,
        error: errorMessage,
        message: "신고 내역 조회 실패",
      },
      {
        status: statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}
