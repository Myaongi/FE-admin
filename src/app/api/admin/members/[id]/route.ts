import { NextRequest, NextResponse } from "next/server";
import { mockMembers } from "@/lib/mock/members";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 환경 변수로 목업 데이터 사용 여부 결정
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === "true";

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
      // 실제 서버 API 호출 (향후 구현)
      console.log("🌐 실제 서버 API 호출 (구현 예정)");
      return NextResponse.json(
        { error: "실제 서버 API는 아직 구현되지 않았습니다." },
        {
          status: 501,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 환경 변수로 목업 데이터 사용 여부 결정
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === "true" || true; // 항상 목업 사용

    if (useMockData) {
      // 목업 데이터에서 사용자 찾기
      const member = mockMembers.find((member) => member.memberId === memberId);

      if (!member) {
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

      // 삭제 시뮬레이션 (실제로는 mockMembers 배열을 직접 수정할 수 없으므로)
      const response = {
        isSuccess: true,
        code: "COMMON200",
        message: "SUCCESS!",
        result: "계정 삭제가 완료되었습니다.",
      };

      console.log("사용자 삭제 API 응답:", response);
      return NextResponse.json(response, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}
