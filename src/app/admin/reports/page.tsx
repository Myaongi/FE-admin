"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/tables/AdminTable";
import TablePagination from "@/components/tables/TablePagination";
import ReportDetailModal from "@/components/ReportDetailModal";
import PostDetailModal from "@/components/PostDetailModal";
import ReportStatusBadge from "@/components/badge/ReportStatusBadge";
import {
  getReports,
  ignoreReport,
  deleteReportedPost,
  Report,
} from "@/lib/reports-api";

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
  const [processingReportIds, setProcessingReportIds] = useState<
    Record<number, "delete" | "ignore">
  >({});
  const [processedReportIds, setProcessedReportIds] = useState<
    Record<number, "delete" | "ignore">
  >({});
  const [processedAtMap, setProcessedAtMap] = useState<Record<number, string>>(
    {}
  );

  // 신고 내역 목록 조회
  const fetchReports = async (page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔥 신고 내역 API 호출: page=${page}, size=${pageSize}`);

      const response = await getReports({
        page,
        size: pageSize,
      });

      console.log("📦 신고 내역 API 응답:", response);

      if (response.isSuccess && response.result) {
        const reportsData = response.result.content || [];

        // 새로고침 시에도 처리 상태가 유지되도록 sessionStorage의 마커를 반영
        const processedMapFromStorage: Record<number, "delete" | "ignore"> = {};
        const processedAtFromStorage: Record<number, string> = {};
        const withClientProcessed = reportsData.map((r) => {
          if (typeof window === "undefined") return r;
          const raw = sessionStorage.getItem(`reportProcessed:${r.reportId}`);
          if (!raw) return r;
          try {
            const { action, date } = JSON.parse(raw) as {
              action: "delete" | "ignore";
              date?: string;
            };
            const status = "처리완료";
            processedMapFromStorage[r.reportId] = action;
            if (date) {
              processedAtFromStorage[r.reportId] = date;
            }
            return { ...r, status };
          } catch {
            return r;
          }
        });

        setReports(withClientProcessed);
        if (Object.keys(processedMapFromStorage).length > 0) {
          setProcessedReportIds((prev) => ({
            ...prev,
            ...processedMapFromStorage,
          }));
        }
        if (Object.keys(processedAtFromStorage).length > 0) {
          setProcessedAtMap((prev) => ({ ...prev, ...processedAtFromStorage }));
        }

        // 서버가 이미 처리된 항목은 세션 마커 제거
        if (typeof window !== "undefined") {
          reportsData.forEach((r) => {
            // 서버 상태가 삭제됨/무시됨이면 세션 마커 제거
            // (단순 "처리완료"는 액션 구분이 없어 마커 유지)
            if (r.status.includes("삭제됨") || r.status.includes("무시됨")) {
              sessionStorage.removeItem(`reportProcessed:${r.reportId}`);
            }
          });
        }

        setTotalElements(response.result.totalElements || reportsData.length);
        setTotalPages(
          response.result.totalPages || Math.ceil(reportsData.length / pageSize)
        );
        setCurrentPage(page);
        console.log("✅ 신고 내역 로드 성공:", reportsData.length, "건");
      } else {
        throw new Error("신고 내역을 불러올 수 없습니다.");
      }
    } catch (err: any) {
      console.error("신고 내역 조회 오류:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "신고 내역을 불러오는데 실패했습니다."
      );
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
  const handleIgnore = async (type: "LOST" | "FOUND", reportId: number) => {
    if (!confirm("정말 이 신고를 무시 처리하시겠습니까?")) return;

    try {
      console.log(`🩶 신고 무시 처리: type=${type}, reportId=${reportId}`);
      setProcessingReportIds((prev) => ({ ...prev, [reportId]: "ignore" }));

      const response = await ignoreReport(type, reportId);

      console.log("📦 신고 무시 처리 응답:", response);

      if (response.isSuccess) {
        alert("✅ 신고 무효처리가 완료되었습니다.");
        setProcessedReportIds((prev) => ({ ...prev, [reportId]: "ignore" }));
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const label = `${yy}.${mm}.${dd}`;
        setProcessedAtMap((prev) => ({
          ...prev,
          [reportId]: label,
        }));
        // 낙관적 UI 업데이트
        setReports((prev) =>
          prev.map((r) =>
            r.reportId === reportId ? { ...r, status: "처리완료" } : r
          )
        );
        // 새로고침 대비 세션 저장
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `reportProcessed:${reportId}`,
            JSON.stringify({ action: "ignore", date: label })
          );
        }

        // 서버에서 최신 데이터 다시 가져오기
        await fetchReports(currentPage);
      } else {
        throw new Error(response.message || "신고 무효처리에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("신고 무시 처리 오류:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "서버 오류가 발생했습니다."
      );
    } finally {
      setProcessingReportIds((prev) => {
        const { [reportId]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // 신고 게시글 삭제 핸들러
  const handleDelete = async (type: "LOST" | "FOUND", reportId: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      console.log(`🧹 신고 게시글 삭제: type=${type}, reportId=${reportId}`);
      setProcessingReportIds((prev) => ({ ...prev, [reportId]: "delete" }));

      const response = await deleteReportedPost(type, reportId);

      console.log("📦 신고 게시글 삭제 응답:", response);

      if (response.isSuccess) {
        alert("🗑️ 신고된 게시글이 성공적으로 삭제되었습니다.");
        setProcessedReportIds((prev) => ({ ...prev, [reportId]: "delete" }));
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const label = `${yy}.${mm}.${dd}`;
        setProcessedAtMap((prev) => ({
          ...prev,
          [reportId]: label,
        }));
        // 낙관적 UI 업데이트
        setReports((prev) =>
          prev.map((r) =>
            r.reportId === reportId ? { ...r, status: "처리완료" } : r
          )
        );
        // 새로고침 대비 세션 저장
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `reportProcessed:${reportId}`,
            JSON.stringify({ action: "delete", date: label })
          );
        }

        // 서버에서 최신 데이터 다시 가져오기
        await fetchReports(currentPage);
      } else {
        throw new Error(response.message || "삭제에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("신고 게시글 삭제 오류:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "서버 오류가 발생했습니다."
      );
    } finally {
      setProcessingReportIds((prev) => {
        const { [reportId]: _removed, ...rest } = prev;
        return rest;
      });
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
  const renderReportStatusBadge = (status: string) => {
    return <ReportStatusBadge status={status} />;
  };

  // 관리자 작업 버튼/상태 렌더링
  const renderAdminActions = (report: Report) => {
    const isProcessing = Boolean(processingReportIds[report.reportId]);
    const processedByClient = processedReportIds[report.reportId];
    const processedByServer = report.status.includes("처리완료");
    const isProcessed = Boolean(processedByClient) || processedByServer;

    // 처리 완료 또는 서버에서 이미 처리된 경우: 비활성 박스 표시
    if (isProcessed) {
      const action: "delete" | "ignore" | "unknown" =
        processedByClient ?? "unknown";
      const baseLabel =
        action === "delete"
          ? "삭제 완료"
          : action === "ignore"
          ? "무시 완료"
          : "처리 완료";
      const datePrefix = processedAtMap[report.reportId]
        ? `${processedAtMap[report.reportId]} `
        : "";
      return (
        <div className="px-2 py-1.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed select-none">
          {`${datePrefix}${baseLabel}`.trim()}
        </div>
      );
    }

    // 진행 중: 버튼 비활성 및 진행 문구
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleDelete(report.type, report.reportId)}
          disabled={isProcessing}
          className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
            isProcessing
              ? "bg-red-50 border-red-200 text-red-300 cursor-not-allowed"
              : "bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
          }`}
        >
          {processingReportIds[report.reportId] === "delete"
            ? "삭제 중..."
            : "삭제"}
        </button>
        <button
          onClick={() => handleIgnore(report.type, report.reportId)}
          disabled={isProcessing}
          className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
            isProcessing
              ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
              : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {processingReportIds[report.reportId] === "ignore"
            ? "무시 중..."
            : "무시"}
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
          onClick={() => {
            console.log("🟣 report 객체 전체:", report);
            console.log("🟡 클릭됨:", report.targetPostId, report.type);
            handlePostDetailClick(report.targetPostId || 0, report.type);
          }}
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
      render: (value: string) => <ReportStatusBadge status={value} />,
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
            신고 내역 관리
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
