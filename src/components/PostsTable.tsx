"use client";

interface Post {
  postId: number;
  status: string;
  title: string;
  authorName: string;
  createdAt: number[];
  region: string;
}

interface PostsTableProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  onDetailClick: (postId: number) => void;
}

export default function PostsTable({
  posts,
  loading,
  error,
  onDetailClick,
}: PostsTableProps) {
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

  return (
    <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
      <table className="table-auto min-w-max w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-transparent">
          <tr>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              상태
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              대표사진
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              제목
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              username
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              작성일
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              위치
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
              상세보기
            </th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-semibold text-black tracking-tight leading-5 border-b border-gray-300 whitespace-nowrap">
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
            posts.map((post) => (
              <tr key={post.postId} className="hover:bg-gray-50">
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  {renderStatusBadge(post.status)}
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  <div
                    className="w-11 h-11 bg-gray-100 rounded-lg bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>")`,
                      backgroundSize: "20px",
                    }}
                  ></div>
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
                    onClick={() => onDetailClick(post.postId)}
                  >
                    상세보기
                  </button>
                </td>
                <td className="px-2 lg:px-4 py-2 border-b border-gray-100 align-middle whitespace-nowrap">
                  <button className="px-3 py-1.5 bg-red-600 border-none rounded-full text-sm font-medium text-white tracking-tight leading-5 cursor-pointer transition-all duration-200 hover:bg-red-700">
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
