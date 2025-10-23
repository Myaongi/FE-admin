"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import PostDetailModal from "@/components/PostDetailModal";
import FilterButtons from "@/components/FilterButtons";
import AiToggle from "@/components/AiToggle";
import PostsTable from "@/components/PostsTable";

interface Post {
  postId: number;
  type: "LOST" | "FOUND";
  status: string;
  thumbnailUrl: string;
  title: string;
  authorName: string;
  createdAt: number[];
  region: string;
  aiImage?: string | null;
  realImages?: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

interface PostsResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export default function PostsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "FOUND" | "LOST">("ALL");
  const [aiOnly, setAiOnly] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<
    "LOST" | "FOUND" | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDetailClick = (postId: number) => {
    const post = posts.find((p) => p.postId === postId);
    if (post) {
      setSelectedPostId(postId);
      setSelectedPostType(post.type);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
    setSelectedPostType(null);
  };

  const handleModalDelete = (postId: number, postType: "LOST" | "FOUND") => {
    // 모달에서 삭제된 경우 테이블 상태 업데이트
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.postId === postId
          ? {
              ...p,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const handleDeleteClick = async (postId: number) => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const post = posts.find((p) => p.postId === postId);
      if (!post) {
        alert("게시글을 찾을 수 없습니다.");
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("인증 토큰이 없습니다.");
        return;
      }

      // API 삭제 호출 (apiClient 사용)
      const response = await fetch(`/api/admin/posts/${postId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.isSuccess) {
        // 프론트엔드 상태 즉시 업데이트
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.postId === postId
              ? {
                  ...p,
                  isDeleted: true,
                  deletedAt: data.result?.deletedAt || new Date().toISOString(),
                }
              : p
          )
        );
        alert("게시글이 삭제되었습니다.");
      } else {
        throw new Error(data.message || data.error || "삭제에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("게시글 삭제 오류:", error);
      alert(error.message || "게시글 삭제에 실패했습니다.");
    }
  };

  // API 호출 함수
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      console.log(
        "🔑 토큰으로 API 호출:",
        accessToken.substring(0, 20) + "..."
      );
      console.log(`📊 필터: ${filter}, AI만: ${aiOnly}`);

      const response = await axios.get("/api/admin/posts", {
        params: {
          type: filter,
          aiOnly: aiOnly,
          page: 0,
          size: 20,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("📦 API 응답:", response.data);

      if (response.data.isSuccess) {
        const data = response.data.result.content;
        // 중복된 postId 제거 (같은 postId가 있으면 첫 번째 것만 유지)
        const uniquePosts = data.filter(
          (post: any, index: number, self: any[]) =>
            index === self.findIndex((p: any) => p.postId === post.postId)
        );
        setPosts(uniquePosts);
      } else {
        throw new Error(
          response.data.message || response.data.error || "API 응답 오류"
        );
      }
    } catch (err: any) {
      console.error("API 호출 오류:", err);

      // 에러 메시지 설정
      if (err.response?.status === 404) {
        setError("API 엔드포인트를 찾을 수 없습니다.");
      } else if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
      } else if (err.response?.status === 500) {
        setError("서버 오류가 발생했습니다.");
      } else {
        setError("게시글을 불러오는데 실패했습니다.");
      }

      // 에러 발생 시 빈 배열로 설정
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 필터 또는 AI 토글 변경 시 API 호출
  useEffect(() => {
    fetchPosts();
  }, [filter, aiOnly]);

  // 소제목 동적 변경
  const getCardTitle = () => {
    if (filter === "ALL") return "전체 게시물 목록";
    if (filter === "FOUND") return "발견했어요 게시물 목록";
    if (filter === "LOST") return "잃어버렸어요 게시물 목록";
    return "전체 게시물 목록";
  };

  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-wide leading-9">
            게시물 관리
          </h1>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-900 tracking-tight leading-4">
              {getCardTitle()}
            </h3>
          </div>

          <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
            <FilterButtons filter={filter} onFilterChange={setFilter} />
            <AiToggle aiOnly={aiOnly} onToggle={() => setAiOnly(!aiOnly)} />
          </div>

          <PostsTable
            posts={posts}
            loading={loading}
            error={error}
            onDetailClick={handleDetailClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      {/* 상세보기 모달 */}
      <PostDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        postId={selectedPostId}
        postType={selectedPostType}
        onDelete={handleModalDelete}
      />
    </>
  );
}
