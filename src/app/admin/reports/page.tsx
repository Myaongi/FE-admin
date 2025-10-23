"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/tables/AdminTable";
import TablePagination from "@/components/tables/TablePagination";
import ReportDetailModal from "@/components/ReportDetailModal";
import PostDetailModal from "@/components/PostDetailModal";
import { Report } from "@/lib/mock/reports";

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<
    "LOST" | "FOUND" | null
  >(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<
    "LOST" | "FOUND" | null
  >(null);

  // 신고 내역 목록 조회 (실제 API 호출)
  const fetchReports = async (page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      console.log(`🔥 신고 내역 API 호출: page=${page}, size=${pageSize}`);

      const response = await fetch(
        `/api/admin/reports?page=${page}&size=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📦 신고 내역 API 응답:", data);

      if (data.isSuccess && data.result) {
        const reportsData = data.result.content || data.result;
        setReports(reportsData);
        setTotalElements(data.result.totalElements || reportsData.length);
        setTotalPages(
          data.result.totalPages || Math.ceil(reportsData.length / pageSize)
        );
        setCurrentPage(page);
      } else {
        throw new Error(data.error || "신고 내역을 불러올 수 없습니다.");
      }
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

  // 신고 상세보기 핸들러
  const handleReportDetailClick = (
    reportId: number,
    reportType: "LOST" | "FOUND"
  ) => {
    setSelectedReportId(reportId);
    setSelectedReportType(reportType);
    setIsReportModalOpen(true);
  };

  // 게시물 상세보기 핸들러
  const handlePostDetailClick = (
    postId: number,
    postType: "LOST" | "FOUND"
  ) => {
    setSelectedPostId(postId);
    setSelectedPostType(postType);
    setIsPostModalOpen(true);
  };

  // 신고 모달 닫기 핸들러
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setSelectedReportId(null);
    setSelectedReportType(null);
  };

  // 게시물 모달 닫기 핸들러
  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPostId(null);
    setSelectedPostType(null);
  };

  // 신고 무시 처리 핸들러
  const handleIgnore = async (type: string, reportId: number) => {
    if (!confirm("정말 이 신고를 무시 처리하시겠습니까?")) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("인증 토큰이 없습니다.");
        return;
      }

      console.log(`🩶 신고 무시 처리: type=${type}, reportId=${reportId}`);

      const response = await fetch(
        `/api/admin/reports/${type}/${reportId}/ignore`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      console.log("📦 신고 무시 처리 응답:", data);

      if (response.ok && data.isSuccess) {
        alert("✅ 신고 무효처리가 완료되었습니다.");
        fetchReports(currentPage); // 목록 재조회
      } else {
        alert("❌ 신고 무효처리에 실패했습니다: " + (data.message || "오류"));
      }
    } catch (err) {
      console.error("신고 무시 처리 오류:", err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 신고 게시글 삭제 핸들러
  const handleDelete = async (type: string, reportId: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("인증 토큰이 없습니다.");
        return;
      }

      console.log(`🧹 신고 게시글 삭제: type=${type}, reportId=${reportId}`);

      const response = await fetch(
        `/api/admin/reports/${type}/${reportId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      console.log("📦 신고 게시글 삭제 응답:", data);

      if (response.ok && data.isSuccess) {
        alert("🗑️ 신고된 게시글이 성공적으로 삭제되었습니다.");
        fetchReports(currentPage); // 목록 재조회
      } else {
        alert("❌ 삭제에 실패했습니다: " + (data.message || "오류 발생"));
      }
    } catch (err) {
      console.error("신고 게시글 삭제 오류:", err);
      alert("서버 오류가 발생했습니다.");
    }
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
          onClick={() => handleDelete(report.type, report.reportId)}
          className="px-3 py-1.5 bg-red-100 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
        >
          삭제
        </button>
        <button
          onClick={() => handleIgnore(report.type, report.reportId)}
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
      render: (value: string, report: Report) => (
        <button
          onClick={() =>
            handlePostDetailClick(report.targetPostId || 0, report.type)
          }
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
      label: "신고 상태",
      render: (value: string) => renderStatusBadge(value),
    },
    {
      key: "reportDetail",
      label: "신고 상세보기",
      render: (_value: unknown, report: Report) => (
        <button
          onClick={() => handleReportDetailClick(report.reportId, report.type)}
          className="px-3 py-1.5 text-gray-700 rounded-full text-sm font-medium transition-colors bg-white hover:bg-gray-100 border border-gray-300"
        >
          상세보기
        </button>
      ),
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

      {/* 신고 상세보기 모달 */}
      <ReportDetailModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        reportId={selectedReportId}
        reportType={selectedReportType}
      />

      {/* 게시물 상세보기 모달 */}
      <PostDetailModal
        isOpen={isPostModalOpen}
        onClose={handleClosePostModal}
        postId={selectedPostId}
        postType={selectedPostType}
      />
    </>
  );
}
