import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api-client";
import { mockPostDetails } from "@/lib/mock/posts";

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
  context: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await context.params;
    const postId = parseInt(id);
    const postType = type;

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
      const postDetail = mockPostDetails[postId];

      if (!postDetail) {
        return NextResponse.json(
          { error: "게시글을 찾을 수 없습니다." },
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

      // 타입 검증
      if (postDetail.type !== postType) {
        return NextResponse.json(
          { error: "게시글 타입이 일치하지 않습니다." },
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      }

      const response = {
        isSuccess: true,
        result: postDetail,
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
      // 실제 서버 API 호출 - 개별 조회가 안 되므로 전체 목록에서 찾기
      const apiClient = getApiClient();

      // Authorization 헤더에서 토큰 추출
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "") || "";

      console.log("🔍 전체 목록에서 포스트 찾기:", postId, "타입:", postType);
      console.log(
        "🔑 사용할 토큰:",
        token ? token.substring(0, 20) + "..." : "없음"
      );

      try {
        // 전체 목록 조회
        const response = await apiClient.getPosts(
          {
            type: undefined,
            aiOnly: undefined,
            page: 1,
            size: 1000, // 충분히 큰 수로 설정
          },
          token
        );

        console.log("📦 전체 목록 서버 응답:", response);

        if (response.isSuccess && response.result) {
          console.log("✅ 전체 목록 응답 성공");

          // 해당 postId와 타입을 가진 포스트 찾기
          const targetPost = response.result.content.find(
            (post: any) => post.postId === postId && post.type === postType
          );

          if (targetPost) {
            console.log("✅ 포스트 찾음:", targetPost);
            return NextResponse.json(
              {
                isSuccess: true,
                result: targetPost,
                message: "SUCCESS!",
                code: "COMMON200",
              },
              {
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
              }
            );
          } else {
            console.log("❌ 포스트를 찾을 수 없음:", postId, "타입:", postType);
            return NextResponse.json(
              { error: "게시글을 찾을 수 없습니다." },
              {
                status: 404,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
              }
            );
          }
        } else {
          console.log(
            "❌ 전체 목록 응답 실패:",
            response.message || response.error
          );
          return NextResponse.json(
            {
              error:
                response.message ||
                response.error ||
                "게시글 목록을 가져올 수 없습니다.",
            },
            {
              status: 500,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                  "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
              },
            }
          );
        }
      } catch (error) {
        console.error("전체 목록 조회 중 오류:", error);
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
          { error: "게시글을 찾을 수 없습니다." },
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
