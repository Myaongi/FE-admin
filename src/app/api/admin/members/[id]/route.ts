import { NextRequest, NextResponse } from "next/server";
import { mockMembers } from "@/lib/mock/members";

// CORS preflight 요청 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const memberId = parseInt(id);

    // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
    const authHeader = request.headers.get("authorization");
    if (!authHeader && process.env.NODE_ENV === "production") {
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

    // 환경 변수로 목업 데이터 사용 여부 결정 (실제 서버 사용)
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === "true";
    console.log("🎭 목업 데이터 사용 여부:", useMockData);
    console.log(
      "🔧 환경 변수 NEXT_PUBLIC_USE_MOCK:",
      process.env.NEXT_PUBLIC_USE_MOCK
    );
    console.log("🔧 NODE_ENV:", process.env.NODE_ENV);

    if (useMockData) {
      // 목업 데이터 사용
      const memberDetail = mockMembers.find(
        (member) => member.memberId === memberId
      );

      if (!memberDetail) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      }

      // memberId를 id로 매핑
      const mappedMember = {
        ...memberDetail,
        id: memberDetail.memberId,
      };

      const response = {
        isSuccess: true,
        result: mappedMember,
      };

      console.log("API 응답:", response);
      return NextResponse.json(response, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else {
      // 실제 서버 API 호출
      try {
        const externalApiUrl = "http://54.180.54.51:8080";
        const fullUrl = `${externalApiUrl}/api/admin/members/${memberId}`;
        console.log("🌐 외부 API 직접 호출:", fullUrl);

        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader && { Authorization: authHeader }),
          },
          // 타임아웃 설정
          signal: AbortSignal.timeout(10000), // 10초 타임아웃
        });

        console.log(
          "📡 외부 API 응답 상태:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ 외부 API 오류 응답:", errorText);
          console.error("❌ 응답 상태:", response.status, response.statusText);
          console.error("❌ 요청 URL:", fullUrl);
          console.error("❌ 요청 헤더:", {
            "Content-Type": "application/json",
            ...(authHeader && { Authorization: authHeader }),
          });
          throw new Error(
            `외부 서버 응답 오류: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("✅ 외부 서버 응답 성공:", JSON.stringify(data, null, 2));
        return NextResponse.json(data, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      } catch (err) {
        console.error("❌ 외부 서버 요청 실패:", err);

        // 구체적인 오류 메시지 제공
        let errorMessage = "서버 요청에 실패했습니다.";
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            errorMessage = "서버 응답 시간이 초과되었습니다.";
          } else if (err.message.includes("fetch failed")) {
            errorMessage =
              "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
          } else {
            errorMessage = err.message;
          }
        }

        return NextResponse.json(
          {
            error: errorMessage,
            details: err instanceof Error ? err.message : String(err),
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("API Error:", error);

    // 서버에서 온 상태 코드가 있으면 그대로 사용
    if (error && typeof error === "object" && "status" in error) {
      const status = (error as any).status;
      const statusText = (error as any).statusText || "Server Error";

      console.log(`🔍 서버 상태 코드 전달: ${status} ${statusText}`);

      return NextResponse.json(
        { error: (error as any).message || "서버 오류가 발생했습니다." },
        {
          status: status,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // 에러 타입에 따른 적절한 응답
    if (error instanceof Error) {
      if (error.message.includes("401")) {
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
      } else if (error.message.includes("404")) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      } else if (error.message.includes("네트워크")) {
        return NextResponse.json(
          { error: "서버에 연결할 수 없습니다. 네트워크를 확인해주세요." },
          {
            status: 503,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      }
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = request.headers.get("authorization");

    if (!id) {
      return NextResponse.json(
        { error: "회원 ID가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // ✅ 실서버 API URL
    const externalUrl = `http://54.180.54.51:8080/api/admin/members/${id}`;

    const res = await fetch(externalUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await res.json();
    console.log("✅ 사용자 삭제 응답:", data);

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("❌ 사용자 삭제 오류:", error);
    return NextResponse.json(
      { error: "서버 요청 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
