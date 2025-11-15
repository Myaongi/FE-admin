import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api-client";
import { mockPostDetails } from "@/lib/mock/posts";
import { getPostDetail, deletePost } from "@/lib/posts-api";

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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ type: string; id: string }> }
) {
  console.log("🗑️ 게시글 삭제 API 호출됨!");

  try {
    const { type, id } = await context.params;
    const postId = parseInt(id);
    const postType = type.toUpperCase() as "LOST" | "FOUND";

    console.log(`📊 파라미터 - type: ${postType}, postId: ${postId}`);

    // Authorization 헤더 확인
    const authHeader = request.headers.get("authorization");
    console.log("🔐 인증 헤더:", authHeader ? "있음" : "없음");

    if (!authHeader && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 환경 변수로 목업 데이터 사용 여부 결정
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === "true";
    console.log("🎭 목업 데이터 사용 여부:", useMockData);

    if (useMockData) {
      // 목업 데이터 사용 - 실제 DB에서는 soft delete 처리
      const deletedAt = new Date();

      const response = {
        isSuccess: true,
        result: {
          postId,
          isDeleted: true,
          deletedAt: deletedAt.toISOString(),
        },
      };

      console.log("✅ 게시글 삭제 처리 (목업):", response);
      return NextResponse.json(response, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else {
      // 실제 서버 API 호출 - posts-api.ts 사용
      console.log("🌐 실제 서버 API 호출 시작");

      try {
        const token = authHeader ? authHeader.replace("Bearer ", "") : null;
        const response = await deletePost(postType, postId, token);

        console.log("✅ 외부 서버 응답 성공:", response);

        if (response.isSuccess) {
          return NextResponse.json(response, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods":
                "GET, POST, PUT, DELETE, OPTIONS, PATCH",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          });
        } else {
          throw new Error(
            response.error || response.message || "삭제에 실패했습니다."
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
              "Access-Control-Allow-Methods":
                "GET, POST, PUT, DELETE, OPTIONS, PATCH",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      }
    }
  } catch (error: any) {
    console.error("게시글 삭제 오류:", error);

    // axios 에러의 경우 외부 서버의 상태 코드를 그대로 전달
    const statusCode = error?.response?.status || 500;
    let errorMessage = "게시글 삭제에 실패했습니다.";

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
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
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
      // 실제 서버 API 호출 - posts-api.ts 사용
      console.log("🔍 단건 게시글 조회:", postId, "타입:", postType);

      try {
        const token = authHeader ? authHeader.replace("Bearer ", "") : null;
        const response = await getPostDetail(
          postType as "LOST" | "FOUND",
          postId,
          token
        );

        console.log("📦 단건 상세 서버 응답:", response);

        if (response.isSuccess && response.result) {
          return NextResponse.json(
            {
              isSuccess: true,
              result: response.result,
              message: response.message || "SUCCESS!",
              code: response.code || "COMMON200",
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
        }

        const errorMessage =
          response.error || response.message || "게시글을 가져올 수 없습니다.";

        return NextResponse.json(
          { error: errorMessage },
          {
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      } catch (error: any) {
        console.error("단건 상세 조회 중 오류:", error);

        // axios 에러의 경우 외부 서버의 상태 코드를 그대로 전달
        const statusCode = error?.response?.status || 500;
        let errorMessage = "서버 오류가 발생했습니다.";

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
