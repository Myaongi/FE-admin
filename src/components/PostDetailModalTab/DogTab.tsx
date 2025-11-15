"use client";
import { useEffect, useState } from "react";
import { getImageUrl } from "@/lib/url-utils";
import { PostDetail } from "@/lib/posts-api";

interface DogTabProps {
  postDetail: PostDetail;
  getGenderText: (gender: string | undefined) => string;
}

export default function DogTab({ postDetail, getGenderText }: DogTabProps) {
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  return (
    <div className="space-y-6">
      {/* 강아지 기본 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          강아지 기본 정보
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-3">
          {postDetail.type === "LOST" && postDetail.dogName && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                강아지 이름
              </label>
              <div className="text-gray-900 font-medium">
                {postDetail.dogName}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              품종
            </label>
            <div className="text-gray-900">{postDetail.breed}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              색상
            </label>
            <div className="text-gray-900">{postDetail.color}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              성별
            </label>
            <div className="text-gray-900">
              {getGenderText(postDetail.gender)}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 mb-4">상세 정보</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-900 leading-relaxed">
            {postDetail.description}
          </p>
        </div>
      </div>

      {/* 강아지 사진 */}
      {(postDetail.thumbnailUrl ||
        postDetail.aiImage ||
        (postDetail.realImages && postDetail.realImages.length > 0)) &&
        (() => {
          // thumbnailUrl 우선, AI 이미지와 일반 이미지는 공존할 수 없음
          const allImages = postDetail.thumbnailUrl
            ? [postDetail.thumbnailUrl]
            : postDetail.aiImage
            ? [postDetail.aiImage]
            : postDetail.realImages || [];
          const total = allImages.length;
          const maxToShow = showAllImages
            ? Math.min(10, total)
            : Math.min(3, total);
          const imagesToRender = allImages.slice(0, maxToShow);

          // Lightbox keyboard handlers
          useEffect(() => {
            const onKey = (e: KeyboardEvent) => {
              if (selectedImageIndex === null) return;
              if (e.key === "Escape") {
                setSelectedImageIndex(null);
              } else if (e.key === "ArrowLeft") {
                setSelectedImageIndex((prev) => {
                  if (prev === null) return prev;
                  return Math.max(0, prev - 1);
                });
              } else if (e.key === "ArrowRight") {
                setSelectedImageIndex((prev) => {
                  if (prev === null) return prev;
                  return Math.min(Math.min(10, total) - 1, prev + 1);
                });
              }
            };
            window.addEventListener("keydown", onKey);
            return () => window.removeEventListener("keydown", onKey);
          }, [selectedImageIndex, total]);

          return (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                강아지 사진
              </h4>

              {/* 미리보기 그리드 */}
              <div className="grid grid-cols-3 gap-3">
                {imagesToRender.map((src, idx) => {
                  const globalIndex = idx; // since slice starts at 0
                  const isRepresentative = globalIndex === 0; // 첫 번째 썸네일에 라벨 표시
                  const isAiImage =
                    postDetail.aiImage &&
                    globalIndex === 0 &&
                    !postDetail.thumbnailUrl; // thumbnailUrl이 없고 AI 이미지가 있으면 첫 번째만 뱃지
                  return (
                    <button
                      key={`dog-image-${postDetail.postId}-${idx}-${src?.slice(
                        -10
                      )}`}
                      type="button"
                      className="group relative w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                      onClick={() => setSelectedImageIndex(globalIndex)}
                    >
                      {/* 1:1 비율 컨테이너 */}
                      <div className="relative w-full pb-[100%]">
                        <img
                          src={getImageUrl(src) || "/placeholder.svg"}
                          alt={`강아지 사진 ${globalIndex + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* AI 생성 뱃지 */}
                        {isAiImage && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                            AI 생성
                          </div>
                        )}

                        {isRepresentative && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-sm sm:text-base font-medium py-2 text-center rounded-b-lg">
                            대표 사진
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 전체보기 버튼 */}
              {!showAllImages && total > 3 && (
                <div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                    onClick={() => setShowAllImages(true)}
                  >
                    전체보기 ({Math.min(10, total)}장)
                  </button>
                </div>
              )}

              {/* 라이트박스 모달 */}
              {selectedImageIndex !== null && (
                <div
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
                  onClick={() => setSelectedImageIndex(null)}
                >
                  <div
                    className="relative max-w-4xl w-full px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative w-full pb-[56.25%] bg-black/20 rounded-lg overflow-hidden">
                      <img
                        src={
                          getImageUrl(
                            allImages.slice(0, Math.min(10, total))[
                              selectedImageIndex
                            ]
                          ) || "/placeholder.svg"
                        }
                        alt={`확대 이미지 ${selectedImageIndex + 1}`}
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                      />
                      {/* 좌우 네비게이션 */}
                      <button
                        type="button"
                        aria-label="이전 이미지"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow"
                        onClick={() =>
                          setSelectedImageIndex((prev) => {
                            if (prev === null) return prev;
                            return Math.max(0, prev - 1);
                          })
                        }
                        disabled={selectedImageIndex === 0}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        aria-label="다음 이미지"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow"
                        onClick={() =>
                          setSelectedImageIndex((prev) => {
                            if (prev === null) return prev;
                            const last = Math.min(10, total) - 1;
                            return Math.min(last, prev + 1);
                          })
                        }
                        disabled={
                          selectedImageIndex === Math.min(10, total) - 1
                        }
                      >
                        ›
                      </button>
                    </div>

                    {/* 닫기 버튼 */}
                    <div className="flex justify-end mt-3">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                        onClick={() => setSelectedImageIndex(null)}
                      >
                        닫기 (ESC)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
}
