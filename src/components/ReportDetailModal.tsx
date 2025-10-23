"use client";

import { useState, useEffect } from "react";

interface ReportDetail {
  reportId: number;
  type: "LOST" | "FOUND";
  reason: string;
  reporterName: string;
  reportedAt: number[];
  targetPostId: number;
  targetTitle: string;
  targetContent?: string;
  imagePreview?: string | null;
  realImages?: string[];
  status: string;
  detailReason?: string;
}

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: number | null;
  reportType: "LOST" | "FOUND" | null;
}

// 목업 데이터
const mockReportDetail: ReportDetail = {
  reportId: 1,
  type: "LOST",
  reason: "스팸/홍보/도배",
  reporterName: "lee2",
  reportedAt: [2025, 10, 13, 22, 0, 23],
  targetPostId: 6,
  targetTitle: "도배 홍보(은 팝니다)",
  targetContent: "귀여운 목걸이",
  imagePreview: null,
  realImages: [],
  status: "대기 중",
  detailReason: "도배 홍보!!",
};

export default function ReportDetailModal({
  isOpen,
  onClose,
  reportId,
  reportType,
}: ReportDetailModalProps) {
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 날짜 포맷팅 (YYYY-MM-DD HH:mm)
  const formatDateTime = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 6) return "-";
    const [year, month, day, hour, minute] = dateArray;
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // 신고 상세 정보 조회
  const fetchReportDetail = async () => {
    if (!reportId || !reportType) return;

    setLoading(true);
    setError(null);

    try {
      // 목업 데이터 사용 (실제 API 연동 시 교체)
      await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      setReportDetail(mockReportDetail);

      // 실제 API 호출 (주석 처리)
      /*
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await fetch(
        `http://54.180.54.51:8080/api/admin/reports/${reportType}/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.isSuccess) {
        setReportDetail(data.result);
      } else {
        throw new Error(data.message || "신고 상세 정보를 불러오는데 실패했습니다.");
      }
      */
    } catch (err: any) {
      console.error("신고 상세 정보 조회 오류:", err);
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 데이터 조회
  useEffect(() => {
    if (isOpen && reportId && reportType) {
      fetchReportDetail();
    } else {
      setReportDetail(null);
      setError(null);
    }
  }, [isOpen, reportId, reportType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            📋 신고 상세보기
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">불러오는 중...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          ) : reportDetail ? (
            <div className="space-y-6">
              {/* 신고 내역 상세 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  신고 내역 상세
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="w-24 font-medium text-gray-600">
                        신고자:
                      </span>
                      <span className="text-gray-900">
                        {reportDetail.reporterName}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-medium text-gray-600">
                        신고일:
                      </span>
                      <span className="text-gray-900">
                        {formatDateTime(reportDetail.reportedAt)}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-medium text-gray-600">
                        게시물 ID:
                      </span>
                      <span className="text-gray-900">
                        {reportDetail.targetPostId}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="w-24 font-medium text-gray-600">
                        신고 사유:
                      </span>
                      <span className="text-gray-900">
                        {reportDetail.reason}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-medium text-gray-600">
                        상세 사유:
                      </span>
                      <span className="text-gray-900">
                        {reportDetail.detailReason || "-"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-medium text-gray-600">
                        처리 상태:
                      </span>
                      <span className="text-gray-900">
                        {reportDetail.status}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 구분선 */}
              <div className="border-t border-gray-200 pt-6">
                {/* 신고된 게시글 정보 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    신고된 게시글 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex">
                        <span className="w-24 font-medium text-gray-600">
                          게시물 제목:
                        </span>
                        <span className="text-gray-900">
                          {reportDetail.targetTitle}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-24 font-medium text-gray-600">
                          작성자:
                        </span>
                        <span className="text-gray-900">
                          {reportDetail.reporterName}
                        </span>
                      </div>
                      {reportDetail.targetContent && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900">
                            강아지 상세 정보
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                            {reportDetail.targetContent}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">
                        강아지 사진
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        {reportDetail.imagePreview ||
                        (reportDetail.realImages &&
                          reportDetail.realImages.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const allImages = [
                                ...(reportDetail.imagePreview
                                  ? [reportDetail.imagePreview]
                                  : []),
                                ...(reportDetail.realImages || []),
                              ].filter(Boolean);

                              return allImages.slice(0, 3).map((src, idx) => {
                                const isAiImage =
                                  idx === 0 && reportDetail.imagePreview;

                                return (
                                  <div
                                    key={src + idx}
                                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                                  >
                                    <img
                                      src={src}
                                      alt={`강아지 사진 ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />

                                    {/* AI 생성 뱃지 */}
                                    {isAiImage && (
                                      <div className="absolute top-1 right-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-semibold px-1 py-0.5 rounded-full shadow-md">
                                        AI
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        ) : (
                          <p className="text-gray-400">이미지가 없습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
