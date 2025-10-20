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
        status: '귀가 완료',
        title: '우리강아지좀찾아주세요ㅠㅠ',
        authorName: '동물지킴이',
        createdAt: [2024, 12, 20],
        region: '서울시 강남구',
        isAiGenerated: false,
        content: '우리 강아지가 실종되어 찾고 있습니다. 매우 소중한 가족이에요. 발견하시면 꼭 연락 부탁드립니다.',
        images: [
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop'
        ],
        dogInfo: {
            breed: '포메라니안',
            color: '흰색',
            gender: '암컷',
            description: '소형견, 목에 핑크색 리본 착용'
        },
        location: {
            address: '서울시 강남구 논현동 456-78',
            latitude: 37.5665,
            longitude: 126.9780
        }
    },
    4: {
        postId: 4,
        type: 'LOST',
        status: '실종',
        title: '시바견 "초코" 실종신고',
        authorName: '강아지사랑',
        createdAt: [2024, 12, 19],
        region: '서울시 서초구',
        isAiGenerated: true,
        content: '시바견 초코가 실종되었습니다. 매우 활발하고 장난꾸러기입니다. 발견하시면 연락 부탁드립니다.',
        images: [
            'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop'
        ],
        dogInfo: {
            breed: '시바견',
            color: '갈색',
            gender: '수컷',
            description: '중형견, 꼬리가 말려있음'
        },
        location: {
            address: '서울시 서초구 서초동 789-12',
            latitude: 37.4945,
            longitude: 127.0276
        }
    },
    5: {
        postId: 5,
        type: 'FOUND',
        status: '발견',
        title: '공원에서 발견한 강아지',
        authorName: '산책러',
        createdAt: [2024, 12, 19],
        region: '서울시 마포구',
        isAiGenerated: false,
        content: '마포구 한강공원에서 길 잃은 강아지를 발견했습니다. 매우 순하고 건강해 보입니다.',
        images: [
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop'
        ],
        dogInfo: {
            breed: '믹스견',
            color: '검은색과 흰색',
            gender: '암컷',
            description: '중형견, 귀가 늘어져 있음'
        },
        location: {
            address: '서울시 마포구 한강공원',
            latitude: 37.5665,
            longitude: 126.9780
        }
    }
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const postId = parseInt(params.id);

        // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
        const authHeader = request.headers.get('authorization');
        if (!authHeader && process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const postDetail = mockPostDetails[postId];

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
