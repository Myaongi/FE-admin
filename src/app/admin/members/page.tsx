"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/tables/AdminTable";
import TablePagination from "@/components/tables/TablePagination";
import SearchFilter from "@/components/filters/SearchFilter";
import DropdownPortal from "@/components/ui/DropdownPortal";
import MembersDetailModal from "@/components/MembersDetailModal";
import ActivityBadge from "@/components/badge/ActivityBadge";

interface Member {
  id: number;
  nickname: string;
  email: string;
  joinedAt: number[];
  status: "ACTIVATED" | "UNACTIVATED";
}

interface MembersResponse {
  content: Member[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  totalUsers: number;
}

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
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      // 토큰 형식 확인
      console.log("🔑 토큰 길이:", accessToken.length);
      console.log("🔑 토큰 시작:", accessToken.substring(0, 20) + "...");
      console.log(
        "🔑 토큰 끝:",
        "..." + accessToken.substring(accessToken.length - 20)
      );

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });

      if (query.trim()) {
        params.append("query", query.trim());
      }

      const response = await fetch(`/api/admin/members?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP ${response.status} 오류:`, errorText);

        // 403 오류인 경우 토큰이 만료되었을 가능성이 높음
        if (response.status === 403) {
          console.error("🔐 403 오류: 토큰이 만료되었거나 권한이 없습니다.");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("📦 API 응답 데이터:", data);

      if (data.isSuccess) {
        const result = data.result as MembersResponse;
        setMembers(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages);
        setCurrentPage(result.page);
        setTotalUsers(result.totalUsers || result.totalElements);
        console.log("✅ 사용자 목록 로드 성공:", result.content.length, "명");
        console.log("✅ 사용자 목록:", result.content);
      } else {
        console.error("❌ API 응답 실패:", data);
        throw new Error(data.message || data.error || "API 응답 오류");
      }
    } catch (err: unknown) {
      console.error("사용자 목록 조회 오류:", err);

      // 구체적인 오류 메시지 설정
      let errorMessage = "사용자 목록을 불러오는데 실패했습니다.";
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        } else if (err.message.includes("timeout")) {
          errorMessage =
            "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
        } else if (err.message.includes("401")) {
          errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
        } else if (err.message.includes("500")) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
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
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/admin/members/${memberId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.isSuccess) {
        const statusKorean = status === "ACTIVATED" ? "활성화됨" : "비활성화됨";
        alert(`계정이 ${statusKorean} 상태로 변경되었습니다.`);
        handleCloseDropdown();

        // 상태가 UNACTIVATED로 변경된 경우 현재 날짜를 로컬 스토리지에 저장
        if (status === "UNACTIVATED") {
          const deactivatedAt = new Date();
          const deactivatedAtArray = [
            deactivatedAt.getFullYear(),
            deactivatedAt.getMonth() + 1,
            deactivatedAt.getDate(),
          ];

          // 로컬 스토리지에서 기존 비활성화 사용자 데이터 가져오기
          const deactivatedUsers = JSON.parse(
            localStorage.getItem("deactivatedUsers") || "{}"
          );
          deactivatedUsers[memberId] = deactivatedAtArray;
          localStorage.setItem(
            "deactivatedUsers",
            JSON.stringify(deactivatedUsers)
          );

          console.log(
            `📅 사용자 ${memberId} 비활성화 날짜 저장:`,
            deactivatedAtArray
          );
        } else if (status === "ACTIVATED") {
          // 활성화된 경우 비활성화 날짜 제거
          const deactivatedUsers = JSON.parse(
            localStorage.getItem("deactivatedUsers") || "{}"
          );
          delete deactivatedUsers[memberId];
          localStorage.setItem(
            "deactivatedUsers",
            JSON.stringify(deactivatedUsers)
          );

          console.log(`📅 사용자 ${memberId} 비활성화 날짜 제거`);
        }

        // 로컬 상태 즉시 업데이트
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === memberId ? { ...member, status } : member
          )
        );

        // 서버 데이터와 동기화 (선택적)
        // fetchMembers(searchQuery, currentPage);
      } else {
        throw new Error(
          data.message || data.error || "상태 변경에 실패했습니다."
        );
      }
    } catch (err: unknown) {
      console.error("상태 변경 오류:", err);
      alert((err as Error).message || "상태 변경에 실패했습니다.");
    }
  };

  // 계정 삭제 핸들러
  const handleDelete = async (memberId: number) => {
    if (!confirm("정말로 이 계정을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: "DELETE",
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
        alert(data.result || "계정이 삭제되었습니다.");
        handleCloseDropdown();
        // 테이블 다시 갱신
        fetchMembers(searchQuery, currentPage);
      } else {
        throw new Error(
          data.message || data.error || "계정 삭제에 실패했습니다."
        );
      }
    } catch (err: unknown) {
      console.error("계정 삭제 오류:", err);
      alert((err as Error).message || "계정 삭제에 실패했습니다.");
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
              <div className="text-sm text-gray-600">
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
