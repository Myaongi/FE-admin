import { NextRequest, NextResponse } from "next/server";
import { mockMembers } from "@/lib/mock/members";

// CORS preflight 요청 처리
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
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id);
    const body = await request.json();
    const { status } = body;

    // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
    const authHeader = request.headers.get("authorization");
    if (!authHeader && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
              "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // 환경 변수로 목업 데이터 사용 여부 결정
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === "true" || true; // 항상 목업 사용

    if (useMockData) {
      // 목업 데이터에서 사용자 찾기
      const memberIndex = mockMembers.findIndex(
        (member) => member.memberId === memberId
      );

      if (memberIndex === -1) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods":
                "GET, POST, PUT, DELETE, OPTIONS, PATCH",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      }

      // 상태 업데이트 (실제로는 mockMembers 배열을 직접 수정할 수 없으므로 시뮬레이션)
      const updatedMember = {
        ...mockMembers[memberIndex],
        status: status,
      };

      const response = {
        isSuccess: true,
        result: updatedMember,
        message: "상태가 성공적으로 변경되었습니다.",
      };

      console.log("상태 변경 API 응답:", response);
      return NextResponse.json(response, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else {
      // 실제 서버 API 호출 (향후 구현)
      console.log("🌐 실제 서버 API 호출 (구현 예정)");
      return NextResponse.json(
        { error: "실제 서버 API는 아직 구현되지 않았습니다." },
        {
          status: 501,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
              "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      {
        status: 500,
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
