"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/tables/AdminTable";
import TablePagination from "@/components/tables/TablePagination";
import SearchFilter from "@/components/filters/SearchFilter";
import DropdownPortal from "@/components/ui/DropdownPortal";
import MembersDetailModal from "@/components/MembersDetailModal";
import ActivityBadge from "@/components/badge/ActivityBadge";
import {
  getMembers,
  updateMemberStatus,
  deleteMember,
  Member,
} from "@/lib/members-api";

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // 드롭다운 닫기 핸들러
  const handleCloseDropdown = () => {
    setActiveDropdown(null);
    setAnchorEl(null);
  };

  // 사용자 목록 조회
  const fetchMembers = async (query: string = "", page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`👥 사용자 목록 API 호출: query=${query}, page=${page}, size=${pageSize}`);

      const response = await getMembers({
        query: query.trim() || undefined,
        page,
        size: pageSize,
      });

      console.log("📦 사용자 목록 API 응답:", response);

      if (response.isSuccess && response.result) {
        setMembers(response.result.content);
        setTotalElements(response.result.totalElements);
        setTotalPages(response.result.totalPages);
        setCurrentPage(response.result.page);
        setTotalUsers(response.result.totalUsers || response.result.totalElements);
        console.log("✅ 사용자 목록 로드 성공:", response.result.content.length, "명");
      } else {
        throw new Error("사용자 목록을 불러올 수 없습니다.");
      }
    } catch (err: any) {
      console.error("사용자 목록 조회 오류:", err);

      // 401 에러 시 로그아웃
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "사용자 목록을 불러오는데 실패했습니다."
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  // useEffect(() => {
  //   fetchMembers();
  // }, [pageSize]);
  // 초기 데이터 로드
  useEffect(() => {
    fetchMembers();
  }, [pageSize]);

  // 검색 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
    fetchMembers(query, 0);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMembers(searchQuery, page);
  };

  // 페이지 크기 변경 핸들러
  const handleSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    fetchMembers(searchQuery, 0);
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
  const renderStatusBadge = (status: "ACTIVATED" | "UNACTIVATED") => {
    return <ActivityBadge status={status} />;
  };

  // 관리자 작업 드롭다운 렌더링
  const renderAdminActions = (member: Member) => {
    const isOpen = activeDropdown === member.id;

    return (
      <div className="relative inline-block">
        <button
          ref={(el) => {
            if (isOpen && el) {
              setAnchorEl(el);
            }
          }}
          onClick={() => {
            if (isOpen) {
              handleCloseDropdown();
            } else {
              setActiveDropdown(member.id);
            }
          }}
          className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          관리자 작업 ▼
        </button>

        <DropdownPortal
          anchorEl={isOpen ? anchorEl : null}
          open={isOpen}
          onClose={handleCloseDropdown}
          align="left"
          offsetY={8}
          zIndex={1000}
        >
          <div className="py-1">
            <button
              onClick={() => handleStatusChange(member.id, "ACTIVATED")}
              disabled={member.status === "ACTIVATED"}
              className={`w-full text-left px-4 py-2 text-sm ${
                member.status === "ACTIVATED"
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              계정 활성화
            </button>
            <button
              onClick={() => handleStatusChange(member.id, "UNACTIVATED")}
              disabled={member.status === "UNACTIVATED"}
              className={`w-full text-left px-4 py-2 text-sm ${
                member.status === "UNACTIVATED"
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              계정 비활성화
            </button>
            <button
              onClick={() => handleDelete(member.id)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              계정 삭제
            </button>
          </div>
        </DropdownPortal>
      </div>
    );
  };

  // 상태 변경 핸들러
  const handleStatusChange = async (
    memberId: number,
    status: "ACTIVATED" | "UNACTIVATED"
  ) => {
    try {
      console.log(`🔄 사용자 상태 변경: memberId=${memberId}, status=${status}`);

      const response = await updateMemberStatus(memberId, status);

      console.log("📦 상태 변경 응답:", response);

      if (response.isSuccess) {
        const statusKorean = status === "ACTIVATED" ? "활성화됨" : "비활성화됨";
        alert(`계정이 ${statusKorean} 상태로 변경되었습니다.`);
        handleCloseDropdown();

        // 서버에서 최신 데이터 다시 가져오기
        await fetchMembers(searchQuery, currentPage);
      } else {
        throw new Error(response.message || "상태 변경에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("상태 변경 오류:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "상태 변경에 실패했습니다."
      );
    }
  };

  // 계정 삭제 핸들러
  const handleDelete = async (memberId: number) => {
    if (!confirm("정말로 이 계정을 삭제하시겠습니까?")) {
      return;
    }

    try {
      console.log(`🗑️ 사용자 삭제: memberId=${memberId}`);

      const response = await deleteMember(memberId);

      console.log("📦 삭제 응답:", response);

      if (response.isSuccess) {
        alert(response.result || "계정이 삭제되었습니다.");
        handleCloseDropdown();
        
        // 서버에서 최신 데이터 다시 가져오기
        await fetchMembers(searchQuery, currentPage);
      } else {
        throw new Error(response.message || "계정 삭제에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("계정 삭제 오류:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "계정 삭제에 실패했습니다."
      );
    }
  };

  // 활동 상세보기 핸들러
  const handleViewDetails = (memberId: number) => {
    setSelectedMemberId(memberId);
    setIsMemberModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseMemberModal = () => {
    setIsMemberModalOpen(false);
    setSelectedMemberId(null);
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: "nickname",
      label: "사용자명",
    },
    {
      key: "email",
      label: "아이디(이메일)",
    },
    {
      key: "joinedAt",
      label: "가입일",
      render: (value: number[]) => formatDate(value),
    },
    {
      key: "status",
      label: "활동 상태",
      render: (value: "ACTIVATED" | "UNACTIVATED") => renderStatusBadge(value),
    },
    {
      key: "actions",
      label: "활동 상세보기",
      render: (_value: unknown, member: Member) => (
        <button
          onClick={() => handleViewDetails(member.id)}
          className="px-3 py-1.5 text-gray-700 rounded-full text-sm font-medium transition-colors bg-white hover:bg-gray-100 border border-gray-300"
        >
          상세보기
        </button>
      ),
    },
    {
      key: "adminActions",
      label: "관리자 작업",
      render: (_value: unknown, member: Member) => renderAdminActions(member),
    },
  ];

  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-wide leading-9">
            사용자 관리
          </h1>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-900 tracking-tight leading-4">
              전체 사용자 목록
            </h3>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-black">
                총 사용자 수:{" "}
                <span className="font-medium text-gray-900">{totalUsers}</span>
                명
              </div>
              <div className="w-80">
                <SearchFilter
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  placeholder="사용자명 또는 이메일로 검색하세요"
                />
              </div>
            </div>
          </div>

          <AdminTable
            data={members}
            columns={columns}
            loading={loading}
            error={error}
            emptyMessage="사용자가 없습니다."
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

      {/* 사용자 상세 모달 */}
      <MembersDetailModal
        isOpen={isMemberModalOpen}
        onClose={handleCloseMemberModal}
        memberId={selectedMemberId}
        memberData={members.find((m) => m.id === selectedMemberId) || null}
      />
    </>
  );
}
