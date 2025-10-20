import { NextRequest, NextResponse } from "next/server";

// 목업 상세 데이터
const mockPostDetails: Record<number, any> = {
  1: {
    postId: 1,
    type: "LOST",
    status: "실종",
    title: "쓰꾸삐를.. 잃어버렸습니다",
    authorName: "lee3",
    createdAt: [2025, 10, 12, 21, 6, 0, 403487000],
    region: "서울특별시 서초구",
    aiImage: null,
    realImages: [
      "https://pbs.twimg.com/media/Fw4w5xeagAAUM80.jpg:large",
      "https://pbs.twimg.com/media/FyV6D04aQAAw5Ql.jpg",
      "https://pbs.twimg.com/ext_tw_video_thumb/1664460024733908992/pu/img/IBQt9zAuhz4JuUSP.jpg",
      "https://pbs.twimg.com/media/Fxqt-vpagAAFcYW.jpg",
    ],
    dogName: "멍멍이",
    breed: "골든 리트리버",
    color: "갈색",
    gender: "FEMALE",
    description: "귀여운 목걸이",
    eventDateTime: [2024, 1, 1, 14, 30],
    latitude: 37.4979,
    longitude: 127.0276,
  },
  2: {
    postId: 2,
    type: "FOUND",
    status: "발견",
    title: "길 잃은 강아지 발견했어요",
    authorName: "먀옹이",
    createdAt: [2024, 12, 20],
    region: "서울시 강남구",
    aiImage:
      "https://cdn.pixabay.com/photo/2024/01/31/22/26/ai-generated-8544939_1280.jpg",
    realImages: [],
    breed: "포메라니안",
    color: "흰색",
    gender: "MALE",
    description: "길에서 발견한 강아지입니다. 매우 순하고 건강해 보입니다.",
    eventDateTime: [2024, 12, 20, 15, 30],
    latitude: 37.5665,
    longitude: 126.978,
  },
  3: {
    postId: 3,
    type: "LOST",
    status: "귀가 완료",
    title: "우리강아지좀찾아주세요ㅠㅠ",
    authorName: "동물지킴이",
    createdAt: [2024, 12, 20],
    region: "서울시 강남구",
    aiImage: null, // 일반 이미지만 있음
    realImages: [
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
    ],
    dogName: "뽀삐",
    breed: "포메라니안",
    color: "흰색",
    gender: "FEMALE",
    description: "소형견, 목에 핑크색 리본 착용",
    eventDateTime: [2024, 12, 20, 10, 30],
    latitude: 37.5665,
    longitude: 126.978,
  },
  4: {
    postId: 4,
    type: "LOST",
    status: "실종",
    title: '시바견 "초코" 실종신고',
    authorName: "강아지사랑",
    createdAt: [2024, 12, 19],
    region: "서울시 서초구",
    aiImage:
      "https://png.pngtree.com/png-clipart/20250121/original/pngtree-adorable-elegance-ai-generated-image-of-a-puppy-with-bow-png-image_20116440.png",
    realImages: [], // AI 이미지가 있으면 realImages는 빈 배열
    dogName: "초코",
    breed: "시바견",
    color: "갈색",
    gender: "MALE",
    description: "중형견, 꼬리가 말려있음",
    eventDateTime: [2024, 12, 19, 14, 30],
    latitude: 37.4945,
    longitude: 127.0276,
  },
  5: {
    postId: 5,
    type: "FOUND",
    status: "발견",
    title: "공원에서 발견한 강아지",
    authorName: "산책러",
    createdAt: [2024, 12, 19],
    region: "서울시 마포구",
    aiImage: null, // 일반 이미지만 있음
    realImages: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    ],
    breed: "믹스견",
    color: "검은색과 흰색",
    gender: "FEMALE",
    description: "중형견, 귀가 늘어져 있음",
    eventDateTime: [2024, 12, 19, 16, 45],
    latitude: 37.5665,
    longitude: 126.978,
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);

    // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
    const authHeader = request.headers.get("authorization");
    if (!authHeader && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const postDetail = mockPostDetails[postId];

    if (!postDetail) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const response = {
      isSuccess: true,
      result: postDetail,
    };

    console.log("API 응답:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
