"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { mockMemberDetail } from "@/lib/mock/membersDetail";
import PostDetailModal from "./PostDetailModal";
import Image from "next/image";
import ActivityBadge from "@/components/badge/ActivityBadge";
import { getImageUrl } from "@/lib/url-utils";

interface Member {
  id: number;
  nickname: string;
  email: string;
  joinedAt: number[];
  status: "ACTIVATED" | "UNACTIVATED";
  deactivatedAt?: number[]; // 비활성화 날짜 (UNACTIVATED일 때만 존재)
}

interface ActivityData {
  lostCount: number;
  foundCount: number;
  postAllCount: number;
  reportCount: number;
  postsByMember: Array<{
    postId: number;
    type: "LOST" | "FOUND";
    title: string;
    region: string;
    createdAt: number[];
    thumbnailUrl: string | null;
  }>;
  reportsByMember: Array<{
    reportId: number;
    targetType: "LOST" | "FOUND";
    targetPostId: number;
    targetTitle: string;
    reportType: string;
    reportContent: string;
    reportStatus: "PENDING" | "PROCESSING" | "COMPLETED";
    reportedAt: number[];
  }>;
}

interface MemberDetailResponse {
  id: number;
  nickname: string;
  email: string;
  joinedAt: number[];
  status: "ACTIVATED" | "UNACTIVATED";
  deactivatedAt?: number[]; // 비활성화 날짜 (UNACTIVATED일 때만 존재)
  activity: ActivityData;
}

interface MembersDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: number | null;
  memberData?: Member | null;
}

type TabType = "posts" | "reports";

export default function MembersDetailModal({
  isOpen,
  onClose,
  memberId,
  memberData: propMemberData,
}: MembersDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<
    "LOST" | "FOUND" | null
  >(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [memberDetailData, setMemberDetailData] =
    useState<MemberDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 상세 정보 가져오기
  const fetchMemberDetail = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }

      const response = await fetch(`/api/admin/members/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("📦 사용자 상세 API 응답:", JSON.stringify(data, null, 2));

      if (data.isSuccess && data.result) {
        console.log("✅ 사용자 상세 데이터 설정:", data.result);

        // 로컬 스토리지에서 비활성화 날짜 가져오기
        const memberData = { ...data.result };
        if (memberData.status === "UNACTIVATED" && memberId) {
          const deactivatedUsers = JSON.parse(
            localStorage.getItem("deactivatedUsers") || "{}"
          );
          if (deactivatedUsers[memberId]) {
            memberData.deactivatedAt = deactivatedUsers[memberId];
            console.log(
              `📅 로컬 스토리지에서 비활성화 날짜 로드:`,
              deactivatedUsers[memberId]
            );
          }
        }

        setMemberDetailData(memberData);
      } else {
        console.error("❌ API 응답 실패:", data);
        throw new Error(data.message || data.error || "API 응답 오류");
      }
    } catch (err: any) {
      console.error("사용자 상세 정보 조회 오류:", err);
      setError(err.message || "사용자 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 사용자 상세 정보 가져오기
  useEffect(() => {
    if (isOpen && memberId) {
      fetchMemberDetail(memberId);
    }
  }, [isOpen, memberId]);

  useEffect(() => {
    if (!isOpen) {
      setMemberDetailData(null);
      setError(null);
      setActiveTab("posts");
    }
  }, [isOpen]);

  // 데이터가 없을 때는 로딩 또는 에러 표시
  if (!memberDetailData && !loading && !error) {
    return null;
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 3) return "-";
    const [year, month, day] = dateArray;
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  // 작성글 클릭 핸들러
  const handlePostClick = (postId: number, type: "LOST" | "FOUND") => {
    setSelectedPostId(postId);
    setSelectedPostType(type);
    setIsPostModalOpen(true);
  };

  // PostDetailModal 닫기
  const handlePostModalClose = () => {
    setIsPostModalOpen(false);
    setSelectedPostId(null);
    setSelectedPostType(null);
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status: "ACTIVATED" | "UNACTIVATED") => {
    return <ActivityBadge status={status} />;
  };

  // 게시글 타입 배지 렌더링
  const renderPostTypeBadge = (type: string) => {
    const isLost = type === "잃어버렸어요";
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          isLost ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {type}
      </span>
    );
  };

  // 신고 상태 배지 렌더링
  const renderReportStatusBadge = (
    status: "PENDING" | "PROCESSING" | "COMPLETED"
  ) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      COMPLETED: { text: "처리완료", className: "bg-green-100 text-green-800" },
      PROCESSING: { text: "처리중", className: "bg-blue-100 text-blue-800" },
      PENDING: { text: "대기중", className: "bg-yellow-100 text-yellow-800" },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* 배경 오버레이 */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* 모달 컨테이너 - 중앙 정렬 */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-xl md:max-w-2xl sm:max-w-full sm:mx-0 sm:my-0 sm:h-full sm:rounded-2xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                사용자 상세 정보
              </h3>
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <span className="sr-only">닫기</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 max-h-[80vh] overflow-y-auto sm:max-h-[calc(100vh-8rem)] sm:p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">로딩 중...</div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="text-red-500 text-center">{error}</div>
                  <button
                    onClick={() => memberId && fetchMemberDetail(memberId)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : memberDetailData ? (
                <div>
                  {/* 사용자 기본 정보 */}
                  <div className="bg-gray-50 rounded-lg p-5 space-y-3 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">
                      기본 정보
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">사용자명:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {memberDetailData.nickname}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">이메일:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {memberDetailData.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">가입일:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatDate(memberDetailData.joinedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">활동 상태:</span>
                        {renderStatusBadge(memberDetailData.status)}
                        {memberDetailData.status === "UNACTIVATED" &&
                          memberDetailData.deactivatedAt && (
                            <span className="text-sm text-gray-500 ml-2">
                              (비활성화:{" "}
                              {formatDate(memberDetailData.deactivatedAt)})
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* 탭 버튼 */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      onClick={() => setActiveTab("posts")}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "posts"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      📝 작성글 목록 (
                      {memberDetailData.activity?.postsByMember?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("reports")}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "reports"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      🚨 신고 내역 (
                      {memberDetailData.activity?.reportsByMember?.length || 0})
                    </button>
                  </div>

                  {/* 탭 내용 */}
                  <div>
                    {activeTab === "posts" && (
                      <div className="space-y-3">
                        {(memberDetailData.activity?.postsByMember || [])
                          .length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            작성한 글이 없습니다.
                          </div>
                        ) : (
                          (memberDetailData.activity?.postsByMember || []).map(
                            (post) => (
                              <div
                                key={post.postId}
                                onClick={() =>
                                  handlePostClick(post.postId, post.type)
                                }
                                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                              >
                                {/* 썸네일 */}
                                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden relative">
                                  {post.thumbnailUrl ? (
                                    <Image
                                      src={
                                        getImageUrl(post.thumbnailUrl) ||
                                        "/placeholder.svg"
                                      }
                                      alt={post.title}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      이미지 없음
                                    </div>
                                  )}
                                </div>

                                {/* 게시글 정보 */}
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    {renderPostTypeBadge(
                                      post.type === "LOST"
                                        ? "잃어버렸어요"
                                        : "발견했어요"
                                    )}
                                  </div>
                                  <h5 className="font-semibold text-gray-900">
                                    {post.title}
                                  </h5>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>📍 {post.region}</span>
                                    <span>📅 {formatDate(post.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          )
                        )}
                      </div>
                    )}

                    {activeTab === "reports" && (
                      <div className="space-y-3">
                        {(memberDetailData.activity?.reportsByMember || [])
                          .length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            신고 내역이 없습니다.
                          </div>
                        ) : (
                          (
                            memberDetailData.activity?.reportsByMember || []
                          ).map((report) => (
                            <div
                              key={report.reportId}
                              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:-translate-y-0.5"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {renderReportStatusBadge(report.reportStatus)}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDate(report.reportedAt)}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="font-semibold text-gray-700">
                                    신고 대상:
                                  </span>
                                  <span className="ml-2 text-gray-900">
                                    {report.targetTitle}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-semibold text-gray-700">
                                    신고 유형:
                                  </span>
                                  <span className="ml-2 text-gray-900">
                                    {report.reportType}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-semibold text-gray-700">
                                    신고 내용:
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    {report.reportContent}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex-col sm:gap-2 sm:px-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-full"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PostDetailModal */}
      {isPostModalOpen && (
        <PostDetailModal
          isOpen={isPostModalOpen}
          onClose={handlePostModalClose}
          postId={selectedPostId}
          postType={selectedPostType}
        />
      )}
    </>
  );
}
