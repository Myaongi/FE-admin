"use client";

import ReportStatusBadge from "@/components/badge/ReportStatusBadge";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/url-utils";

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

// 목업 데이터 제거 - 실제 API 사용

export default function ReportDetailModal({
  isOpen,
  onClose,
  reportId,
  reportType,
}: ReportDetailModalProps) {
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미지 보기 상태 관리
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

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
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      console.log(
        `🔍 신고 상세 조회: type=${reportType}, reportId=${reportId}`
      );

      const response = await fetch(
        `/api/admin/reports/${reportType}/${reportId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📦 신고 상세 조회 응답:", data);

      if (data.isSuccess && data.result) {
        setReportDetail(data.result.content);
      } else {
        throw new Error(
          data.error || "신고 상세 정보를 불러오는데 실패했습니다."
        );
      }
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
      setShowAllImages(false);
      setSelectedImageIndex(null);
    }
  }, [isOpen, reportId, reportType]);

  // 키보드 이벤트 핸들러 (ESC, 좌우 화살표)
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!reportDetail) return;
      const allImages = reportDetail.imagePreview
        ? [reportDetail.imagePreview]
        : reportDetail.realImages || [];
      const total = allImages.length;

      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) =>
          prev === null ? 0 : (prev + 1) % total
        );
      } else if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) =>
          prev === null ? 0 : (prev - 1 + total) % total
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, reportDetail]);

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
                <div className="space-y-4 text-sm">
                  {/* 첫 번째 행: 신고자 | 게시물 ID */}
                  <div className="grid grid-cols-2 gap-4">
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
                        게시물 ID:
                      </span>
                      <span className="text-gray-900">
                        {reportDetail.targetPostId}
                      </span>
                    </div>
                  </div>

                  {/* 두 번째 행: 신고일 | 처리 상태 */}
                  <div className="grid grid-cols-2 gap-4">
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
                        처리 상태:
                      </span>
                      <ReportStatusBadge status={reportDetail.status} />
                    </div>
                  </div>

                  {/* 세 번째 행: 신고 사유 */}
                  <div>
                    <div className="flex">
                      <span className="w-24 font-medium text-gray-600">
                        신고 사유:
                      </span>
                      <span className="text-gray-900">
                        {reportDetail.reason}
                      </span>
                    </div>
                  </div>

                  {/* 네 번째 행: 상세 사유 (박스 처리) */}
                  <div>
                    <div className="flex items-start">
                      <span className="w-24 font-medium text-gray-600 pt-1">
                        상세 사유:
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-lg p-3 text-gray-700">
                        {reportDetail.detailReason || "-"}
                      </div>
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
                  <div className="space-y-4 text-sm">
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
                          <>
                            {(() => {
                              const allImages = reportDetail.imagePreview
                                ? [reportDetail.imagePreview]
                                : reportDetail.realImages || [];
                              const total = allImages.length;
                              const imagesToRender = showAllImages
                                ? allImages.slice(0, 10)
                                : allImages.slice(0, 3);

                              return (
                                <>
                                  <div className="grid grid-cols-3 gap-3">
                                    {imagesToRender.map((src, idx) => {
                                      const isRepresentative = idx === 0;
                                      const isAiImage =
                                        reportDetail.imagePreview && idx === 0;
                                      return (
                                        <button
                                          key={`report-image-${idx}-${src?.slice(
                                            -10
                                          )}`}
                                          type="button"
                                          className="group relative w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                                          onClick={() =>
                                            setSelectedImageIndex(idx)
                                          }
                                        >
                                          <div className="relative w-full pb-[100%]">
                                            <img
                                              src={
                                                getImageUrl(src) ||
                                                "/placeholder.svg"
                                              }
                                              alt={`강아지 사진 ${idx + 1}`}
                                              className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            {isAiImage && (
                                              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                                                AI 생성
                                              </div>
                                            )}
                                            {isRepresentative && (
                                              <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-sm font-medium py-2 text-center rounded-b-lg">
                                                대표 사진
                                              </div>
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {!showAllImages && total > 3 && (
                                    <div className="mt-2">
                                      <button
                                        type="button"
                                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                                        onClick={() => setShowAllImages(true)}
                                      >
                                        전체보기 ({Math.min(10, total)}장)
                                      </button>
                                    </div>
                                  )}
                                </>
                              );
                            })()}

                            {/* 라이트박스 모달 */}
                            {selectedImageIndex !== null && (
                              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-75">
                                <button
                                  type="button"
                                  className="absolute top-4 right-4 text-white text-3xl font-bold z-70"
                                  onClick={() => setSelectedImageIndex(null)}
                                  aria-label="닫기"
                                >
                                  &times;
                                </button>
                                <button
                                  type="button"
                                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold z-70"
                                  onClick={() => {
                                    if (!reportDetail) return;
                                    const allImages = reportDetail.imagePreview
                                      ? [reportDetail.imagePreview]
                                      : reportDetail.realImages || [];
                                    const total = allImages.length;
                                    setSelectedImageIndex(
                                      (selectedImageIndex! - 1 + total) % total
                                    );
                                  }}
                                  aria-label="이전 이미지"
                                >
                                  &#8249;
                                </button>
                                <button
                                  type="button"
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold z-70"
                                  onClick={() => {
                                    if (!reportDetail) return;
                                    const allImages = reportDetail.imagePreview
                                      ? [reportDetail.imagePreview]
                                      : reportDetail.realImages || [];
                                    const total = allImages.length;
                                    setSelectedImageIndex(
                                      (selectedImageIndex! + 1) % total
                                    );
                                  }}
                                  aria-label="다음 이미지"
                                >
                                  &#8250;
                                </button>
                                <img
                                  src={
                                    getImageUrl(
                                      reportDetail.imagePreview
                                        ? [reportDetail.imagePreview][
                                            selectedImageIndex
                                          ]
                                        : reportDetail.realImages
                                        ? reportDetail.realImages[
                                            selectedImageIndex
                                          ]
                                        : ""
                                    ) || "/placeholder.svg"
                                  }
                                  alt={`강아지 사진 라이트박스 ${
                                    selectedImageIndex + 1
                                  }`}
                                  className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
                                />
                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 rounded-md px-3 py-1">
                                  {selectedImageIndex! + 1} /{" "}
                                  {reportDetail.imagePreview
                                    ? 1
                                    : reportDetail.realImages
                                    ? reportDetail.realImages.length
                                    : 0}
                                </div>
                              </div>
                            )}
                          </>
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
