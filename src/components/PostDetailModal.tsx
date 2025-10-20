"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import PostTab from "./PostDetailModalTab/PostTab";
import DogTab from "./PostDetailModalTab/DogTab";
import FoundTab from "./PostDetailModalTab/FoundTab";

interface PostDetail {
  postId: number;
  type: "LOST";
  status: string;
  title: string;
  authorName: string;
  createdAt: number[];
  region: string;
  aiImage: string | null;
  realImages: string[];
  dogName: string;
  breed: string;
  color: string;
  gender: "MALE" | "FEMALE";
  description: string;
  eventDateTime: number[];
  latitude: number;
  longitude: number;
}

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
}

export default function PostDetailModal({
  isOpen,
  onClose,
  postId,
}: PostDetailModalProps) {
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"post" | "dog" | "found">("post");

  // 게시글 상세 정보 가져오기
  const fetchPostDetail = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken") || "mock-token";

      console.log("API 호출 시작:", `/api/admin/posts/${id}`);

      const response = await axios.get(`/api/admin/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("API 응답 받음:", response.data);

      if (response.data.isSuccess) {
        console.log("게시글 상세 데이터:", response.data.result);
        setPostDetail(response.data.result);
      } else {
        throw new Error(response.data.error || "API 응답 오류");
      }
    } catch (err: any) {
      console.error("게시글 상세 정보 조회 오류:", err);
      setError("게시글 정보를 불러오는데 실패했습니다.");
      setPostDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 게시글 상세 정보 가져오기
  useEffect(() => {
    if (isOpen && postId) {
      fetchPostDetail(postId);
    }
  }, [isOpen, postId]);

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
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl md:max-w-2xl sm:max-w-full sm:mx-0 sm:my-0 sm:h-full sm:rounded-none">
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
              <div className="flex items-center justify-center py-12">
                <div className="text-red-500">{error}</div>
              </div>
            ) : postDetail ? (
              <div>
                {/* 탭 버튼 */}
                <div className="flex border-b border-gray-200 mb-6">
                  {[
                    { id: "post", label: "게시물 기본 정보" },
                    { id: "dog", label: "강아지 기본 정보" },
                    { id: "found", label: "발견 정보" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(tab.id as "post" | "dog" | "found")
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
                    renderStatusBadge={renderStatusBadge}
                  />
                )}

                {activeTab === "dog" && (
                  <DogTab
                    postDetail={postDetail}
                    getGenderText={getGenderText}
                  />
                )}

                {activeTab === "found" && (
                  <FoundTab
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-full"
              onClick={onClose}
            >
              닫기
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:w-full"
            >
              게시글 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
