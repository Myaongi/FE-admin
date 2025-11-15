import { NextRequest, NextResponse } from "next/server";
import { mockMembersList } from "@/lib/mock/members";
import { getMembers } from "@/lib/members-api";

export async function GET(request: NextRequest) {
  console.log("🔥 Members API 호출됨!");
  console.log("📍 요청 URL:", request.url);

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    console.log(`📊 파라미터 - query: ${query}, page: ${page}, size: ${size}`);

    // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
    const authHeader = request.headers.get("authorization");
    console.log("🔐 인증 헤더:", authHeader ? "있음" : "없음");

    if (!authHeader && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 환경 변수로 목업 데이터 사용 여부 결정 (개발 환경에서는 기본적으로 목업 사용)
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === "true";
    console.log("🎭 목업 데이터 사용 여부:", useMockData);

    if (useMockData) {
      // 목업 데이터 사용
      let filteredMembers = mockMembersList.content;

      // 검색 필터링 (닉네임 또는 이메일)
      if (query.trim()) {
        filteredMembers = mockMembersList.content.filter(
          (member) =>
            member.nickname.toLowerCase().includes(query.toLowerCase()) ||
            member.email.toLowerCase().includes(query.toLowerCase())
        );
      }

      // 페이지네이션 적용
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

      // memberId를 id로 매핑
      const mappedMembers = paginatedMembers.map((member) => ({
        ...member,
        id: member.memberId,
      }));

      // API 응답 구조
      const response = {
        isSuccess: true,
        result: {
          content: mappedMembers,
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: {
              sorted: false,
              unsorted: true,
            },
          },
          totalElements: filteredMembers.length,
          totalPages: Math.ceil(filteredMembers.length / size),
          first: page === 0,
          last: endIndex >= filteredMembers.length,
          numberOfElements: paginatedMembers.length,
          size: size,
          number: page,
          empty: paginatedMembers.length === 0,
          totalUsers: filteredMembers.length,
        },
      };

      console.log("📦 목업 응답:", response);
      return NextResponse.json(response);
    } else {
      try {
        // 실제 서버 API 호출 - members-api.ts 사용
        const token = authHeader ? authHeader.replace("Bearer ", "") : null;
        const response = await getMembers(
          {
            query: query.trim() || undefined,
            page,
            size,
          },
          token
        );

        console.log("✅ 외부 서버 응답 성공:", response);
        return NextResponse.json(response);
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
          { status: statusCode }
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

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
