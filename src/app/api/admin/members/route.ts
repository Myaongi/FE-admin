import { NextRequest, NextResponse } from "next/server";
import { mockMembersList } from "@/lib/mock/members";

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
    const useMockData =
      process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
      process.env.NODE_ENV !== "production";
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
        // 직접 외부 API 호출
        const externalApiUrl = "http://54.180.54.51:8080";
        const queryString = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          ...(query && { query }),
        }).toString();

        const fullUrl = `${externalApiUrl}/api/admin/members?${queryString}`;
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
          throw new Error(
            `외부 서버 응답 오류: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("✅ 외부 서버 응답 성공:", data);
        return NextResponse.json(data);
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

    // 에러 타입에 따른 적절한 응답
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { error: "인증이 필요합니다." },
          { status: 401 }
        );
      } else if (error.message.includes("404")) {
        return NextResponse.json(
          { error: "API 엔드포인트를 찾을 수 없습니다." },
          { status: 404 }
        );
      } else if (error.message.includes("네트워크")) {
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
