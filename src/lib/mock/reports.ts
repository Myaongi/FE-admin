// 신고 내역 관련 목업 데이터
export interface Report {
  reportId: number;
  type: "LOST" | "FOUND";
  reason: string;
  targetTitle: string;
  reporterName: string;
  reportedAt: number[];
  status: "대기 중" | "처리완료";
  targetPostId?: number;
}

export const mockReports: Report[] = [
  {
    reportId: 1,
    type: "LOST",
    reason: "스팸/홍보/도배",
    targetTitle: "저희 블로그 들려보세요",
    reporterName: "lee1",
    reportedAt: [2025, 1, 15, 22, 0, 41],
    status: "대기 중",
    targetPostId: 101,
  },
  {
    reportId: 2,
    type: "FOUND",
    reason: "부적절한 사진/내용",
    targetTitle: "비글 발견했어요!",
    reporterName: "lee2",
    reportedAt: [2025, 1, 14, 22, 30, 10],
    status: "처리완료",
    targetPostId: 102,
  },
  {
    reportId: 3,
    type: "LOST",
    reason: "개인정보 노출",
    targetTitle: "우리 강아지를 찾습니다",
    reporterName: "lee3",
    reportedAt: [2025, 1, 13, 15, 45, 22],
    status: "대기 중",
    targetPostId: 103,
  },
  {
    reportId: 4,
    type: "FOUND",
    reason: "스팸/홍보/도배",
    targetTitle: "강아지 찾아주세요",
    reporterName: "lee4",
    reportedAt: [2025, 1, 12, 10, 20, 15],
    status: "처리완료",
    targetPostId: 104,
  },
  {
    reportId: 5,
    type: "LOST",
    reason: "부적절한 사진/내용",
    targetTitle: "시바견 실종신고",
    reporterName: "lee5",
    reportedAt: [2025, 1, 11, 18, 15, 30],
    status: "대기 중",
    targetPostId: 105,
  },
  {
    reportId: 6,
    type: "FOUND",
    reason: "개인정보 노출",
    targetTitle: "공원에서 발견한 강아지",
    reporterName: "lee6",
    reportedAt: [2025, 1, 10, 14, 30, 45],
    status: "처리완료",
    targetPostId: 106,
  },
  {
    reportId: 7,
    type: "LOST",
    reason: "스팸/홍보/도배",
    targetTitle: "우리 강아지 좀 찾아주세요",
    reporterName: "lee7",
    reportedAt: [2025, 1, 9, 20, 10, 12],
    status: "대기 중",
    targetPostId: 107,
  },
  {
    reportId: 8,
    type: "FOUND",
    reason: "부적절한 사진/내용",
    targetTitle: "길에서 발견한 강아지",
    reporterName: "lee8",
    reportedAt: [2025, 1, 8, 16, 25, 18],
    status: "처리완료",
    targetPostId: 108,
  },
];
