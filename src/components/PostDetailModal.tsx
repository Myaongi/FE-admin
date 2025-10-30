"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { apiClient } from "@/lib/api-client";
import PostTab from "./PostDetailModalTab/PostTab";
import DogTab from "./PostDetailModalTab/DogTab";
import LocationInfoTab from "./PostDetailModalTab/LocationInfoTab";

import { PostDetail } from "@/lib/api-client";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
  postType: "LOST" | "FOUND" | null;
  onDelete?: (postId: number, postType: "LOST" | "FOUND") => void;
}

export default function PostDetailModal({
  isOpen,
  onClose,
  postId,
  postType,
  onDelete,
}: PostDetailModalProps) {
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"post" | "dog" | "location">(
    "post"
  );

  // 게시글 상세 정보 가져오기 - 내부 API 경유
  const fetchPostDetail = async (id: number, type: "LOST" | "FOUND") => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }

      if (!type) {
        throw new Error("게시글 타입이 필요합니다.");
      }

      const url = `/api/admin/posts/${type}/${id}`;
      console.log("API 호출 시작:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API 응답 받음:", data);

      if (data.isSuccess && data.result) {
        const postData = (data.result as any).content || data.result;
        console.log("📋 추출된 게시글 데이터:", postData);

        if (!postData.type) {
          throw new Error(
            `게시물 타입이 없습니다. 받은 데이터: ${JSON.stringify(postData)}`
          );
        }

        if (postData.type !== "LOST" && postData.type !== "FOUND") {
          throw new Error(
            `잘못된 게시물 타입입니다. 받은 타입: "${postData.type}", 예상 타입: "LOST" 또는 "FOUND"`
          );
        }

        if (postData.type !== type) {
          console.warn(
            `⚠️ 타입 불일치: 받은 타입 "${postData.type}", 요청한 타입 "${type}"`
          );
        }

        setPostDetail(postData);
      } else {
        throw new Error(data.error || "API 응답 오류");
      }
    } catch (err: any) {
      console.error("게시글 상세 정보 조회 오류:", err);

      let errorMessage = "게시글 상세 정보를 불러오는데 실패했습니다.";
      if (typeof err.message === "string") {
        if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        } else if (err.message.includes("요청 시간이 초과")) {
          errorMessage =
            "요청 시간이 초과되었습니다. 서버가 응답하지 않습니다.";
        } else if (err.message.includes("401")) {
          errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
        } else if (err.message.includes("404")) {
          errorMessage = "해당 게시글을 찾을 수 없습니다.";
        } else if (err.message.includes("500")) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setPostDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 게시글 상세 정보 가져오기
  useEffect(() => {
    if (isOpen && postId && postType) {
      fetchPostDetail(postId, postType);
    }
  }, [isOpen, postId, postType]);

  useEffect(() => {
    if (!isOpen) {
      setPostDetail(null);
      setError(null);
      setActiveTab("post");
    }
  }, [isOpen]);

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!postId || !postType) {
      alert("삭제할 게시글 정보가 없습니다.");
      return;
    }

    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("인증 토큰이 없습니다.");
        return;
      }

      const response = await apiClient.deletePost(
        postId,
        postType,
        accessToken
      );

      if (response.isSuccess) {
        alert("게시글이 삭제되었습니다.");
        onClose();
        // 부모 컴포넌트에 삭제 완료 알림
        if (onDelete) {
          onDelete(postId, postType);
        }
      } else {
        throw new Error(response.error || "삭제에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("게시글 삭제 오류:", error);
      alert(error.message || "게시글 삭제에 실패했습니다.");
    }
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    const statusMap = {
      실종: { text: "실종", className: "bg-red-100 text-red-800" },
      발견: { text: "발견", className: "bg-yellow-100 text-yellow-800" },
      "귀가 완료": {
        text: "귀가 완료",
        className: "bg-green-100 text-green-800",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      text: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  // 날짜 포맷팅
  const formatDate = (dateArray: number[] | undefined) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 5) {
      return "날짜 정보 없음";
    }

    const [year, month, day, hour, minute] = dateArray;

    if (
      year === undefined ||
      month === undefined ||
      day === undefined ||
      hour === undefined ||
      minute === undefined
    ) {
      return "날짜 정보 불완전";
    }

    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  // 시간 포맷팅
  const formatTime = (dateArray: number[] | undefined) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 5) {
      return "시간 정보 없음";
    }

    const [year, month, day, hour, minute] = dateArray;

    if (hour === undefined || minute === undefined) {
      return "시간 정보 불완전";
    }

    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // 성별 한글 변환
  const getGenderText = (gender: string | undefined) => {
    if (!gender) return "모름";
    return gender === "MALE" ? "수컷" : "암컷";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* 모달 컨테이너 - 중앙 정렬 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-xl md:max-w-2xl sm:max-w-full sm:mx-0 sm:my-0 sm:h-full sm:rounded-2xl">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              게시물 상세 정보
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
                  onClick={() =>
                    postId && postType && fetchPostDetail(postId, postType)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : postDetail ? (
              <div>
                {/* 탭 버튼 */}
                <div className="flex border-b border-gray-200 mb-6">
                  {[
                    { id: "post", label: "📝 게시물 기본 정보" },
                    { id: "dog", label: "🐶 강아지 기본 정보" },
                    {
                      id: "location",
                      label:
                        postDetail.type === "LOST"
                          ? "🐾 실종 정보"
                          : "🐾 발견 정보",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(tab.id as "post" | "dog" | "location")
                      }
                      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 탭 내용 */}
                {activeTab === "post" && (
                  <PostTab
                    postDetail={postDetail}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}

                {activeTab === "dog" && (
                  <DogTab
                    postDetail={postDetail}
                    getGenderText={getGenderText}
                  />
                )}

                {activeTab === "location" && (
                  <LocationInfoTab
                    postDetail={postDetail}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}
              </div>
            ) : null}
          </div>

          {/* 모달 푸터 */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex-col sm:gap-2 sm:px-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:w-full"
              onClick={handleDelete}
            >
              게시글 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
