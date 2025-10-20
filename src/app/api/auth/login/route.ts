import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🔐 로그인 API 호출됨!");

  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("📧 로그인 시도:", email);

    // 실제 서버로 로그인 요청 전송
    const serverUrl = "http://54.180.54.51:8080";

    // 가능한 로그인 엔드포인트들을 시도
    const possibleEndpoints = [
      "/api/auth/login",
      "/api/login",
      "/login",
      "/auth/login",
      "/api/admin/login",
    ];

    let response;
    let lastError;

    for (const endpoint of possibleEndpoints) {
      try {
        console.log("🌐 로그인 엔드포인트 시도:", `${serverUrl}${endpoint}`);

        response = await fetch(`${serverUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        console.log("📡 응답 상태:", response.status, response.statusText);

        // 404가 아니면 이 엔드포인트가 맞는 것
        if (response.status !== 404) {
          console.log("✅ 유효한 엔드포인트 발견:", endpoint);
          break;
        }
      } catch (error) {
        console.log("❌ 엔드포인트 실패:", endpoint, error);
        lastError = error;
        continue;
      }
    }

    if (!response) {
      throw new Error("모든 로그인 엔드포인트 시도 실패");
    }

    console.log("📡 서버 응답 상태:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 서버 로그인 실패:", errorText);

      let errorMessage = "로그인에 실패했습니다.";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      "✅ 서버 로그인 성공 - 전체 응답:",
      JSON.stringify(data, null, 2)
    );
    console.log("🔍 서버 응답 분석:", {
      isSuccess: data.isSuccess,
      code: data.code,
      message: data.message,
      hasAccessToken: !!data.result?.accessToken,
      userId: data.result?.userId,
      memberName: data.result?.memberName,
    });

    // 서버 응답을 그대로 전달
    return NextResponse.json(data);
  } catch (error) {
    console.error("로그인 API 오류:", error);

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        return NextResponse.json(
          { error: "서버에 연결할 수 없습니다. 네트워크를 확인해주세요." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
