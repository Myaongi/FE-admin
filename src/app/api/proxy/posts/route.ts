import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_URL = "http://54.180.54.51:8080";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 원본 요청의 쿼리 파라미터를 그대로 전달
    const queryString = searchParams.toString();
    const externalUrl = `${EXTERNAL_API_URL}/api/admin/posts?${queryString}`;

    console.log("🔄 프록시 요청:", externalUrl);

    // Authorization 헤더 가져오기
    const authHeader = request.headers.get("authorization");

    // 외부 API로 요청 전달
    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    if (!response.ok) {
      console.error("❌ 외부 API 오류:", response.status, response.statusText);
      return NextResponse.json(
        { error: `외부 API 오류: ${response.status} ${response.statusText}` },
        {
          status: response.status,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    const data = await response.json();
    console.log("✅ 프록시 응답 성공");

    // CORS 헤더와 함께 응답 반환
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("프록시 오류:", error);
    return NextResponse.json(
      { error: "프록시 서버 오류가 발생했습니다." },
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
}

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
