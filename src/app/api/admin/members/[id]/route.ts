import { NextRequest, NextResponse } from "next/server";
import { mockMembers } from "@/lib/mock/members";
import { getMemberDetail, deleteMember } from "@/lib/members-api";

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
      // 실제 서버 API 호출 - members-api.ts 사용
      try {
        const token = authHeader ? authHeader.replace("Bearer ", "") : null;
        const response = await getMemberDetail(memberId, token);

        console.log(
          "✅ 외부 서버 응답 성공:",
          JSON.stringify(response, null, 2)
        );

        if (response.isSuccess) {
          return NextResponse.json(response, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          });
        } else {
          throw new Error(
            response.error || response.message || "사용자 조회에 실패했습니다."
          );
        }
      } catch (err: any) {
        console.error("❌ 외부 서버 요청 실패:", err);

        // axios 에러의 경우 외부 서버의 상태 코드를 그대로 전달
        const statusCode = err?.response?.status || 500;
        let errorMessage = "서버 요청에 실패했습니다.";

        if (err?.response?.data) {
          errorMessage =
            err.response.data.error ||
            err.response.data.message ||
            errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        return NextResponse.json(
          {
            error: errorMessage,
            details: err instanceof Error ? err.message : String(err),
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
  } catch (error: any) {
    console.error("API Error:", error);

    // axios 에러의 경우 외부 서버의 상태 코드를 그대로 전달
    const statusCode = error?.response?.status || 500;
    let errorMessage = "서버 오류가 발생했습니다.";

    if (error?.response?.data) {
      errorMessage =
        error.response.data.error ||
        error.response.data.message ||
        errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get("authorization");

    if (!id) {
      return NextResponse.json(
        { error: "회원 ID가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // 실제 서버 API 호출 - members-api.ts 사용
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;
    const response = await deleteMember(parseInt(id), token);

    console.log("✅ 사용자 삭제 응답:", response);

    return NextResponse.json(response, {
      status: response.isSuccess ? 200 : 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    console.error("❌ 사용자 삭제 오류:", error);

    // axios 에러의 경우 외부 서버의 상태 코드를 그대로 전달
    const statusCode = error?.response?.status || 500;
    let errorMessage = "서버 요청 중 오류가 발생했습니다.";

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
            "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}
