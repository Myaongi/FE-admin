"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostDetailModal from "@/components/PostDetailModal";
import FilterButtons from "@/components/FilterButtons";
import AiToggle from "@/components/AiToggle";
import PostsTable from "@/components/PostsTable";
import { getPosts, deletePost, Post } from "@/lib/posts-api";

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

  const handleDetailClick = (type: "FOUND" | "LOST", postId: number) => {
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
    // 모달에서 삭제된 경우 목록 새로고침
    fetchPosts();
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

      console.log(`🗑️ 게시글 삭제: type=${post.type}, postId=${postId}`);

      const response = await deletePost(post.type, postId);

      console.log("📦 게시글 삭제 응답:", response);

      if (response.isSuccess) {
        alert("게시글이 삭제되었습니다.");
        
        // 서버에서 최신 데이터 다시 가져오기
        await fetchPosts();
      } else {
        throw new Error(response.message || "삭제에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("게시글 삭제 오류:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "게시글 삭제에 실패했습니다."
      );
    }
  };

  // API 호출 함수
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`📊 게시물 조회: 필터=${filter}, AI만=${aiOnly}`);

      const response = await getPosts({
        type: filter,
        aiOnly: aiOnly,
        page: 0,
        size: 20,
      });

      console.log("📦 게시물 API 응답:", response);

      if (response.isSuccess && response.result) {
        const data = response.result.content || [];

        // 타입 + ID로 유니크 처리
        const uniquePosts = data.map((post: any) => ({
          ...post,
          uniqueKey: `${post.type}-${post.postId}`,
        }));

        setPosts(uniquePosts);
        console.log("✅ 게시물 로드 성공:", uniquePosts.length, "건");
      } else {
        throw new Error("게시물을 불러올 수 없습니다.");
      }
    } catch (err: any) {
      console.error("게시물 조회 오류:", err);

      // 에러 메시지 설정
      if (err.response?.status === 404) {
        setError("API 엔드포인트를 찾을 수 없습니다.");
      } else if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
      } else if (err.response?.status === 500) {
        setError("서버 오류가 발생했습니다.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "게시글을 불러오는데 실패했습니다."
        );
      }

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
