// 사용자 관련 목업 데이터
export const mockMembers = [
  {
    memberId: 1,
    nickname: "doglover01",
    email: "doglover01@example.com",
    joinedAt: [2024, 10, 5],
    status: "ACTIVATED",
  },
  {
    memberId: 2,
    nickname: "lostandfound",
    email: "lostfound@example.com",
    joinedAt: [2024, 11, 2],
    status: "DEACTIVATED",
  },
  {
    memberId: 3,
    nickname: "puppyfan",
    email: "puppyfan@example.com",
    joinedAt: [2025, 1, 8],
    status: "ACTIVATED",
  },
  {
    memberId: 4,
    nickname: "petfinder",
    email: "petfinder@example.com",
    joinedAt: [2024, 12, 15],
    status: "ACTIVATED",
  },
  {
    memberId: 5,
    nickname: "animalhelper",
    email: "animalhelper@example.com",
    joinedAt: [2024, 9, 20],
    status: "DEACTIVATED",
  },
];

// 사용자 목록 조회용 목업 데이터
export const mockMembersList = {
  content: mockMembers,
  totalElements: mockMembers.length,
  totalPages: 1,
  page: 0,
  size: 20,
  totalUsers: mockMembers.length,
};
