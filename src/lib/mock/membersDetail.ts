export const mockMemberDetail = {
  id: 1,
  name: "멍멍이주인",
  email: "dog_lover@email.com",
  joinedAt: "2024-03-15",
  status: "활성",
  deactivatedAt: null, // 비활성 설정 날짜 (비활성 상태일 때만)
  posts: [
    {
      id: 1,
      type: "잃어버렸어요",
      title: "골든리트리버 '몽이' 찾아요",
      region: "서울 강남구",
      date: "2024-10-15",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      type: "발견했어요",
      title: "발견한 비글 신고",
      region: "서울 서초구",
      date: "2024-10-12",
      image: "/placeholder.svg",
    },
  ],
  reports: [
    {
      id: 1,
      reason: "스팸",
      detail: "불필요한 광고성 게시물 신고",
      date: "2024-10-01",
      status: "처리완료",
    },
  ],
};
