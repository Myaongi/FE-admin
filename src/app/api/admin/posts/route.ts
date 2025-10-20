import { NextRequest, NextResponse } from 'next/server';

// 목업 데이터
const mockPosts = [
    {
        postId: 1,
        type: 'LOST',
        status: '실종',
        title: '골든리트리버 "몽이" 찾아요',
        authorName: '멍멍이주인',
        createdAt: [2024, 12, 20],
        region: '서울시 강남구',
        isAiGenerated: false
    },
    {
        postId: 2,
        type: 'FOUND',
        status: '발견',
        title: '길 잃은 강아지 발견했어요',
        authorName: '먀옹이',
        createdAt: [2024, 12, 20],
        region: '서울시 강남구',
        isAiGenerated: true
    },
    {
        postId: 3,
        type: 'LOST',
        status: '귀가 완료',
        title: '우리강아지좀찾아주세요ㅠㅠ',
        authorName: '동물지킴이',
        createdAt: [2024, 12, 20],
        region: '서울시 강남구',
        isAiGenerated: false
    },
    {
        postId: 4,
        type: 'LOST',
        status: '실종',
        title: '시바견 "초코" 실종신고',
        authorName: '강아지사랑',
        createdAt: [2024, 12, 19],
        region: '서울시 서초구',
        isAiGenerated: true
    },
    {
        postId: 5,
        type: 'FOUND',
        status: '발견',
        title: '공원에서 발견한 강아지',
        authorName: '산책러',
        createdAt: [2024, 12, 19],
        region: '서울시 마포구',
        isAiGenerated: false
    },
    {
        postId: 6,
        type: 'FOUND',
        status: '귀가 완료',
        title: '길에서 발견한 강아지 찾아가셨어요',
        authorName: '발견자',
        createdAt: [2024, 12, 18],
        region: '서울시 송파구',
        isAiGenerated: true
    },
    {
        postId: 7,
        type: 'LOST',
        status: '실종',
        title: '포메라니안 "루이" 실종',
        authorName: '강아지맘',
        createdAt: [2024, 12, 17],
        region: '서울시 강동구',
        isAiGenerated: false
    },
    {
        postId: 8,
        type: 'FOUND',
        status: '발견',
        title: '아파트 주차장에서 발견한 강아지',
        authorName: '관리사무소',
        createdAt: [2024, 12, 16],
        region: '서울시 영등포구',
        isAiGenerated: true
    }
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'ALL';
        const aiOnly = searchParams.get('aiOnly') === 'true';
        const page = parseInt(searchParams.get('page') || '0');
        const size = parseInt(searchParams.get('size') || '20');

        // Authorization 헤더 확인 (개발 환경에서는 생략 가능)
        const authHeader = request.headers.get('authorization');
        if (!authHeader && process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 타입별 필터링
        let filteredPosts = mockPosts;
        if (type === 'FOUND') {
            filteredPosts = mockPosts.filter(post => post.type === 'FOUND');
        } else if (type === 'LOST') {
            filteredPosts = mockPosts.filter(post => post.type === 'LOST');
        }

        // AI 이미지 필터링
        if (aiOnly) {
            filteredPosts = filteredPosts.filter(post => post.isAiGenerated === true);
        }

        // 페이지네이션 적용
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        // API 응답 구조
        const response = {
            success: true,
            result: {
                content: paginatedPosts,
                pageable: {
                    pageNumber: page,
                    pageSize: size,
                    sort: {
                        sorted: false,
                        unsorted: true
                    }
                },
                totalElements: filteredPosts.length,
                totalPages: Math.ceil(filteredPosts.length / size),
                first: page === 0,
                last: endIndex >= filteredPosts.length,
                numberOfElements: paginatedPosts.length,
                size: size,
                number: page,
                empty: paginatedPosts.length === 0
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
