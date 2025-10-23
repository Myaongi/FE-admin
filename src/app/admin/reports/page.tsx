"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/tables/AdminTable";
import TablePagination from "@/components/tables/TablePagination";
import { mockReports, Report } from "@/lib/mock/reports";

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 신고 내역 목록 조회 (목업 데이터 사용)
  const fetchReports = async (page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      // 페이지네이션 계산
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedReports = mockReports.slice(startIndex, endIndex);

      setReports(paginatedReports);
      setTotalElements(mockReports.length);
      setTotalPages(Math.ceil(mockReports.length / pageSize));
      setCurrentPage(page);
    } catch (err: any) {
      console.error("신고 내역 조회 오류:", err);
      setError("신고 내역을 불러오는데 실패했습니다.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchReports();
  }, [pageSize]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReports(page);
  };

  // 페이지 크기 변경 핸들러
  const handleSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    fetchReports(0);
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
      "대기 중": {
        text: "대기 중",
        className: "bg-orange-100 text-orange-700 border border-orange-300",
      },
      처리완료: {
        text: "처리완료",
        className: "bg-green-100 text-green-700 border border-green-300",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      text: status,
      className: "bg-gray-100 text-gray-600 border border-gray-300",
    };

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-center tracking-normal leading-4 ${statusInfo.className}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  // 관리자 작업 버튼 렌더링
  const renderAdminActions = (report: Report) => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => alert("삭제 기능 테스트")}
          className="px-3 py-1.5 bg-red-100 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
        >
          삭제
        </button>
        <button
          onClick={() => alert("무시 기능 테스트")}
          className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          무시
        </button>
      </div>
    );
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: "reason",
      label: "신고 사유",
    },
    {
      key: "targetTitle",
      label: "대상 글 제목",
      render: (value: string) => (
        <button
          onClick={() => alert("신고 상세보기 테스트")}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {value}
        </button>
      ),
    },
    {
      key: "reporterName",
      label: "신고자",
    },
    {
      key: "reportedAt",
      label: "신고일",
      render: (value: number[]) => formatDate(value),
    },
    {
      key: "status",
      label: "상태",
      render: (value: string) => renderStatusBadge(value),
    },
    {
      key: "actions",
      label: "관리자 작업",
      render: (_value: unknown, report: Report) => renderAdminActions(report),
    },
  ];

  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-wide leading-9">
            신고 내역
          </h1>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-900 tracking-tight leading-4">
              전체 신고내역 목록
            </h3>
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
        </div>
      </div>
    </>
  );
}
