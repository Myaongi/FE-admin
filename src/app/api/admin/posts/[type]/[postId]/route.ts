import { NextRequest, NextResponse } from 'next/server';

// 목업 상세 데이터
const mockPostDetails: Record<number, any> = {
    1: {
        postId: 1,
        type: 'LOST',
        status: '실종',
        title: '쓰꾸삐를.. 잃어버렸습니다',
        authorName: 'lee3',
        createdAt: [2025, 10, 12, 21, 6, 0, 403487000],
        region: '서울특별시 서초구',
        aiImage: null,
        realImages: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1547407139-3c921a71905c?w=400&h=300&fit=crop'
        ],
        dogName: '멍멍이',
        breed: '골든 리트리버',
        color: '갈색',
        gender: 'FEMALE',
        description: '귀여운 목걸이',
        eventDateTime: [2024, 1, 1, 14, 30],
        latitude: 37.4979,
        longitude: 127.0276
    },
    2: {
        postId: 2,
        type: 'LOST',
        status: '실종',
        title: '우리 강아지 찾아주세요',
        authorName: '강아지맘',
        createdAt: [2025, 10, 11, 15, 30, 0, 0],
        region: '서울특별시 강남구',
        aiImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
        realImages: [
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop'
        ],
        dogName: '뽀삐',
        breed: '포메라니안',
        color: '흰색',
        gender: 'MALE',
        description: '목에 빨간색 리본 착용',
        eventDateTime: [2024, 1, 2, 10, 15],
        latitude: 37.5665,
        longitude: 126.9780
    },
    3: {
        postId: 3,
        type: 'LOST',
        status: '실종',
        title: '시바견 초코를 찾습니다',
        authorName: '강아지사랑',
        createdAt: [2025, 10, 10, 9, 45, 0, 0],
        region: '서울특별시 마포구',
        aiImage: null,
        realImages: [
            'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop'
        ],
        dogName: '초코',
        breed: '시바견',
        color: '갈색',
        gender: 'MALE',
        description: '꼬리가 말려있고 귀가 쫑긋함',
        eventDateTime: [2024, 1, 3, 16, 20],
        latitude: 37.4945,
        longitude: 127.0276
    }
};

export async function GET(
    request: NextRequest,
    { params }: { params: { type: string; postId: string } }
) {
    try {
        const { type, postId } = params;
        const postIdNum = parseInt(postId);

        console.log('API 호출됨:', { type, postId, postIdNum });

        // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
        const authHeader = request.headers.get('authorization');
        if (!authHeader && process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // type이 LOST가 아닌 경우 에러
        if (type !== 'LOST') {
            return NextResponse.json(
                { error: '지원하지 않는 게시글 타입입니다.' },
                { status: 400 }
            );
        }

        const postDetail = mockPostDetails[postIdNum];

        if (!postDetail) {
            return NextResponse.json(
                { error: '게시글을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        const response = {
            isSuccess: true,
            result: postDetail
        };

        console.log('API 응답:', response);
        return NextResponse.json(response);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
