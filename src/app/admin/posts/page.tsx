"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/tables/AdminTable";
import TablePagination from "@/components/tables/TablePagination";
import SearchFilter from "@/components/filters/SearchFilter";
import PostDetailModal from "@/components/PostDetailModal";

interface Post {
  postId: number;
  type: "LOST" | "FOUND";
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

interface PostsResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<
    "LOST" | "FOUND" | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 게시물 목록 조회
  const fetchPosts = async (query: string = "", page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });

      if (query.trim()) {
        params.append("query", query.trim());
      }

      const response = await fetch(`/api/posts?${params}`, {
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
        const result = data.result as PostsResponse;
        setPosts(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages);
        setCurrentPage(result.page);
      } else {
        throw new Error(data.message || data.error || "API 응답 오류");
      }
    } catch (err: any) {
      console.error("게시물 목록 조회 오류:", err);
      setError("게시물 목록을 불러오는데 실패했습니다.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
    setSelectedPostType(null);
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchPosts();
  }, [pageSize]);

  // 검색 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
    fetchPosts(query, 0);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(searchQuery, page);
  };

  // 페이지 크기 변경 핸들러
  const handleSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    fetchPosts(searchQuery, 0);
  };

  // 날짜 포맷팅
  const formatDate = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 3) return "-";
    const [year, month, day] = dateArray;
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    const statusMap = {
      실종: {
        text: "실종",
        className: "bg-pink-100 text-gray-600 border border-pink-300",
      },
      발견: {
        text: "발견",
        className: "bg-yellow-100 text-gray-600 border border-yellow-400",
      },
      "귀가 완료": {
        text: "귀가 완료",
        className: "bg-blue-100 text-gray-600 border border-blue-300",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      text: status,
      className: "bg-pink-100 text-gray-600 border border-pink-300",
    };

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-center tracking-normal leading-4 ${statusInfo.className}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: "status",
      label: "상태",
      render: (value: string) => renderStatusBadge(value),
    },
    {
      key: "title",
      label: "제목",
    },
    {
      key: "authorName",
      label: "작성자",
    },
    {
      key: "createdAt",
      label: "작성일",
      render: (value: number[]) => formatDate(value),
    },
    {
      key: "region",
      label: "위치",
    },
  ];

  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-wide leading-9">
            게시물 관리
          </h1>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <SearchFilter
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="제목 또는 작성자로 검색하세요"
            />
          </div>

          <AdminTable
            data={posts}
            columns={columns}
            loading={loading}
            error={error}
            emptyMessage="게시물이 없습니다."
            onRowClick={(item) => {
              setSelectedPostId(item.postId);
              setSelectedPostType(item.type);
              setIsModalOpen(true);
            }}
          />

          {totalPages > 1 && (
            <div className="mt-6">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      <PostDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        postId={selectedPostId}
        postType={selectedPostType}
      />
    </>
  );
}
