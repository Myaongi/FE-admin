"use client";

import { getImageUrl } from "@/lib/url-utils";
import StatusBadge from "@/components/badge/StatusBadge";

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

interface PostsTableProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  onDetailClick: (type: "FOUND" | "LOST", postId: number) => void;
  onDeleteClick: (postId: number) => void;
}

export default function PostsTable({
  posts,
  loading,
  error,
  onDetailClick,
}: PostsTableProps) {
  // 대표사진 가져오기
  const getThumbnail = (post: Post) => {
    if (post.thumbnailUrl) {
      return getImageUrl(post.thumbnailUrl) || "/placeholder.svg";
    } else if (post.aiImage) {
      return getImageUrl(post.aiImage) || "/placeholder.svg";
    } else if (Array.isArray(post.realImages) && post.realImages.length > 0) {
      return getImageUrl(post.realImages[0]) || "/placeholder.svg";
    } else {
      return "/placeholder.svg";
    }
  };

  // 삭제 날짜 포맷팅
  const formatDeletedDate = (deletedAt: string) => {
    const date = new Date(deletedAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day} 관리자 삭제`;
  };

  console.log("🔥 PostsTable posts count:", posts.length, posts);

  return (
    <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
      <table className="table-auto min-w-max w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-transparent">
          <tr>
            <th className="px-2 lg:px-4 py-2 text-left text-sm font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              상태
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-sm font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              대표사진
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-sm font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              제목
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-sm font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              username
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-sm font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              작성일
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-sm font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              위치
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-sm font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              상세보기
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-sm font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              관리자 작업
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="text-center py-5">
                로딩 중...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={8} className="text-center py-5 text-red-500">
                {error}
              </td>
            </tr>
          ) : posts.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-5">
                게시글이 없습니다.
              </td>
            </tr>
          ) : (
            posts.map((post, i) => (
              <tr
                key={`${post.type}-${post.postId}-${i}`}
                className="hover:bg-gray-50"
              >
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  <StatusBadge status={post.status} />
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  <div className="relative w-11 h-11 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={getThumbnail(post)}
                      alt="대표사진"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                    {/* AI 생성 뱃지 */}
                    {post.aiImage && (
                      <span className="absolute top-0.5 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-semibold px-2.5 py-0 rounded-full shadow-sm">
                        AI
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  {post.title}
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  {post.authorName}
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  {`${post.createdAt[0]}-${post.createdAt[1]}-${post.createdAt[2]}`}
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  {post.region}
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  <button
                    className="px-3 py-1.5 bg-white border border-black/10 rounded-full text-sm font-medium text-gray-900 tracking-tight leading-5 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                    onClick={() => onDetailClick(post.type, post.postId)}
                  >
                    상세보기
                  </button>
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  {post.isDeleted ? (
                    <span className="text-sm text-gray-500">
                      {post.deletedAt
                        ? formatDeletedDate(post.deletedAt)
                        : "삭제됨"}
                    </span>
                  ) : (
                    <button
                      className="px-3 py-1.5 bg-red-600 border-none rounded-full text-sm font-medium text-white tracking-tight leading-5 cursor-pointer transition-all duration-200 hover:bg-red-700"
                      onClick={() => onDetailClick(post.type, post.postId)}
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
