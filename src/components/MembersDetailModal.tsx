"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { mockMemberDetail } from "@/lib/mock/membersDetail";
import PostDetailModal from "./PostDetailModal";
import Image from "next/image";
import ActivityBadge from "@/components/badge/ActivityBadge";

interface Member {
  id: number;
  nickname: string;
  email: string;
  joinedAt: number[];
  status: "ACTIVATED" | "UNACTIVATED";
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

  // 부모에서 받은 member 데이터와 목업 데이터 병합
  const mockData = mockMemberDetail;
  const memberData = propMemberData
    ? {
        ...mockData,
        id: propMemberData.id,
        name: propMemberData.nickname,
        email: propMemberData.email,
        joinedAt: `${propMemberData.joinedAt[0]}-${String(
          propMemberData.joinedAt[1]
        ).padStart(2, "0")}-${String(propMemberData.joinedAt[2]).padStart(
          2,
          "0"
        )}`,
        status: propMemberData.status as "ACTIVATED" | "UNACTIVATED" | string,
        deactivatedAt:
          propMemberData.status === "UNACTIVATED"
            ? (new Date().toISOString().split("T")[0] as string | null) // 임시로 오늘 날짜 사용 (나중에 API에서 받아올 수 있음)
            : null,
      }
    : mockData;

  // 작성글 클릭 핸들러
  const handlePostClick = (postId: number, type: string) => {
    setSelectedPostId(postId);
    setSelectedPostType(type === "잃어버렸어요" ? "LOST" : "FOUND");
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
  const renderReportStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      처리완료: { text: "처리완료", className: "bg-green-100 text-green-800" },
      처리중: { text: "처리중", className: "bg-blue-100 text-blue-800" },
      대기중: { text: "대기중", className: "bg-yellow-100 text-yellow-800" },
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
                        {memberData.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">이메일:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {memberData.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">가입일:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {memberData.joinedAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">활동 상태:</span>
                      {propMemberData ? (
                        <>
                          {renderStatusBadge(
                            memberData.status as "ACTIVATED" | "UNACTIVATED"
                          )}
                          {memberData.status === "UNACTIVATED" &&
                            "deactivatedAt" in memberData &&
                            memberData.deactivatedAt && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({memberData.deactivatedAt} 비활성화)
                              </span>
                            )}
                        </>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-center tracking-normal leading-4 bg-green-100 text-green-800 border border-green-300">
                          {memberData.status}
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
                    📝 작성글 목록 ({memberData.posts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "reports"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    🚨 신고 내역 ({memberData.reports.length})
                  </button>
                </div>

                {/* 탭 내용 */}
                <div>
                  {activeTab === "posts" && (
                    <div className="space-y-3">
                      {memberData.posts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          작성한 글이 없습니다.
                        </div>
                      ) : (
                        memberData.posts.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => handlePostClick(post.id, post.type)}
                            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                          >
                            {/* 썸네일 */}
                            <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden relative">
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            {/* 게시글 정보 */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                {renderPostTypeBadge(post.type)}
                              </div>
                              <h5 className="font-semibold text-gray-900">
                                {post.title}
                              </h5>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>📍 {post.region}</span>
                                <span>📅 {post.date}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "reports" && (
                    <div className="space-y-3">
                      {memberData.reports.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          신고 내역이 없습니다.
                        </div>
                      ) : (
                        memberData.reports.map((report) => (
                          <div
                            key={report.id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:-translate-y-0.5"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {renderReportStatusBadge(report.status)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {report.date}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">
                                  신고 사유:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {report.reason}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">
                                  상세 내용:
                                </span>
                                <span className="ml-2 text-gray-600">
                                  {report.detail}
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
