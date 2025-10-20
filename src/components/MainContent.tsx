"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import PostDetailModal from "./PostDetailModal";
import FilterButtons from "./FilterButtons";
import AiToggle from "./AiToggle";
import PostsTable from "./PostsTable";

interface Post {
  postId: number;
  status: string;
  title: string;
  authorName: string;
  createdAt: number[];
  region: string;
  aiImage?: string | null;
  realImages?: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

interface MainContentProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function MainContent({
  sidebarOpen,
  onToggleSidebar,
}: MainContentProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "FOUND" | "LOST">("ALL");
  const [aiOnly, setAiOnly] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    console.log("🔐 로그인 상태 확인:", { token: !!token, user: !!userData });

    if (!token || !userData) {
      console.log("❌ 로그인되지 않음, 로그인 페이지로 리다이렉트");
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      console.log("✅ 로그인된 사용자:", parsedUser);
    } catch (error) {
      console.error("사용자 데이터 파싱 오류:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    console.log("🚪 로그아웃");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const handleDetailClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  const handleDeleteClick = async (postId: number) => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.patch(
        `/api/admin/posts/${postId}/delete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.isSuccess) {
        // 프론트엔드 상태 즉시 업데이트
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.postId === postId
              ? {
                  ...post,
                  isDeleted: true,
                  deletedAt: response.data.result.deletedAt,
                }
              : post
          )
        );
        alert("게시글이 삭제되었습니다.");
      } else {
        throw new Error(response.data.error || "삭제에 실패했습니다.");
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
        console.log("❌ 토큰이 없음, 로그인 페이지로 리다이렉트");
        router.push("/login");
        return;
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
    <main className="flex-1 flex flex-col bg-gray-100 transition-all duration-300 min-w-0">
      {/* Header */}
      <header className="bg-white/60 border-b border-black/10 px-6 py-4 h-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="w-7 h-7 border-none bg-none cursor-pointer rounded-lg flex items-center justify-center"
              onClick={onToggleSidebar}
            >
              <div className="w-4 h-4 bg-gray-600 relative transition-all duration-200">
                <div className="absolute top-1 left-0 w-full h-0.5 bg-white transition-all duration-200"></div>
                <div className="absolute bottom-1 left-0 w-full h-0.5 bg-white transition-all duration-200"></div>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-sky-300 rounded-lg"></div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight leading-7">
                강아지킴이 관리자
              </h2>
            </div>
          </div>

          {/* 사용자 정보 및 로그아웃 */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-400 ml-2">({user.email})</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-wide leading-9">
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
      />
    </main>
  );
}
