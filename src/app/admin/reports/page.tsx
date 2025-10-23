"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminTable from "@/components/tables/AdminTable";
import TablePagination from "@/components/tables/TablePagination";
import SearchFilter from "@/components/filters/SearchFilter";

interface Report {
  id: number;
  reporterId: number;
  reporterName: string;
  reportedPostId: number;
  reportedPostTitle: string;
  reason: string;
  description: string;
  status: string;
  createdAt: number[];
  processedAt?: number[];
}

interface ReportsResponse {
  content: Report[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }
  }, [router]);

  // 신고 목록 조회
  const fetchReports = async (query: string = "", page: number = 0) => {
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

      const response = await fetch(`/api/reports?${params}`, {
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
        const result = data.result as ReportsResponse;
        setReports(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages);
        setCurrentPage(result.page);
      } else {
        throw new Error(data.message || data.error || "API 응답 오류");
      }
    } catch (err: any) {
      console.error("신고 목록 조회 오류:", err);
      setError("신고 목록을 불러오는데 실패했습니다.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchReports();
  }, [pageSize]);

  // 검색 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
    fetchReports(query, 0);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReports(searchQuery, page);
  };

  // 페이지 크기 변경 핸들러
  const handleSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    fetchReports(searchQuery, 0);
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
      PENDING: {
        text: "대기중",
        className: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      },
      PROCESSING: {
        text: "처리중",
        className: "bg-blue-100 text-blue-800 border border-blue-300",
      },
      RESOLVED: {
        text: "해결됨",
        className: "bg-green-100 text-green-800 border border-green-300",
      },
      REJECTED: {
        text: "거부됨",
        className: "bg-red-100 text-red-800 border border-red-300",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      text: status,
      className: "bg-gray-100 text-gray-800 border border-gray-300",
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
      key: "reporterName",
      label: "신고자",
    },
    {
      key: "reportedPostTitle",
      label: "신고된 게시물",
    },
    {
      key: "reason",
      label: "신고 사유",
    },
    {
      key: "status",
      label: "처리 상태",
      render: (value: string) => renderStatusBadge(value),
    },
    {
      key: "createdAt",
      label: "신고일",
      render: (value: number[]) => formatDate(value),
    },
  ];

  return (
    <div className="p-6 flex-1">
      <AdminLayout title="신고 내역 관리">
        <div className="mb-6">
          <SearchFilter
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="신고자 또는 게시물 제목으로 검색하세요"
          />
        </div>

        <AdminTable
          data={reports}
          columns={columns}
          loading={loading}
          error={error}
          emptyMessage="신고 내역이 없습니다."
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
      </AdminLayout>
    </div>
  );
}
