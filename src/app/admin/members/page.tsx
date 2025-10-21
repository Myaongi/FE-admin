"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminTable from "@/components/tables/AdminTable";
import TablePagination from "@/components/tables/TablePagination";
import SearchFilter from "@/components/filters/SearchFilter";

interface Member {
  id: number;
  nickname: string;
  email: string;
  createdAt: number[];
  status: "ACTIVATED" | "DEACTIVATED";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }
  }, [router]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });

      if (query.trim()) {
        params.append("query", query.trim());
      }

      const response = await fetch(
        `http://54.180.54.51:8080/api/admin/members?${params}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.isSuccess) {
        const result = data.result as MembersResponse;
        setMembers(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages);
        setCurrentPage(result.page);
        setTotalUsers(result.totalUsers || result.totalElements);
      } else {
        throw new Error(data.message || data.error || "API 응답 오류");
      }
    } catch (err: any) {
      console.error("사용자 목록 조회 오류:", err);
      setError("사용자 목록을 불러오는데 실패했습니다.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

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
  const renderStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVATED: {
        text: "활성",
        className: "bg-green-100 text-green-800 border border-green-300",
      },
      DEACTIVATED: {
        text: "비활성",
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

  // 관리자 작업 드롭다운 렌더링
  const renderAdminActions = (member: Member) => {
    return (
      <div
        className="relative"
        ref={activeDropdown === member.id ? dropdownRef : null}
      >
        <button
          onClick={() =>
            setActiveDropdown(activeDropdown === member.id ? null : member.id)
          }
          className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          관리자 작업 ▼
        </button>

        {activeDropdown === member.id && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={() => handleStatusChange(member.id, "DEACTIVATED")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                계정 정지
              </button>
              <button
                onClick={() => handleStatusChange(member.id, "ACTIVATED")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                계정 정지 복구
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                계정 삭제
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 상태 변경 핸들러
  const handleStatusChange = async (
    memberId: number,
    status: "ACTIVATED" | "DEACTIVATED"
  ) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `http://54.180.54.51:8080/api/admin/members/${memberId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.isSuccess) {
        alert(
          `계정이 ${status === "ACTIVATED" ? "활성화" : "정지"}되었습니다.`
        );
        setActiveDropdown(null);
        // 테이블 다시 갱신
        fetchMembers(searchQuery, currentPage);
      } else {
        throw new Error(
          data.message || data.error || "상태 변경에 실패했습니다."
        );
      }
    } catch (err: any) {
      console.error("상태 변경 오류:", err);
      alert(err.message || "상태 변경에 실패했습니다.");
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

      const response = await fetch(
        `http://54.180.54.51:8080/api/admin/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.isSuccess) {
        alert("계정이 삭제되었습니다.");
        setActiveDropdown(null);
        // 테이블 다시 갱신
        fetchMembers(searchQuery, currentPage);
      } else {
        throw new Error(
          data.message || data.error || "계정 삭제에 실패했습니다."
        );
      }
    } catch (err: any) {
      console.error("계정 삭제 오류:", err);
      alert(err.message || "계정 삭제에 실패했습니다.");
    }
  };

  // 활동 상세보기 핸들러
  const handleViewDetails = (memberId: number) => {
    router.push(`/admin/members/${memberId}/reports`);
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
      key: "createdAt",
      label: "가입일",
      render: (value: number[]) => formatDate(value),
    },
    {
      key: "status",
      label: "활동 상태",
      render: (value: string) => renderStatusBadge(value),
    },
    {
      key: "actions",
      label: "활동 상세보기",
      render: (value: any, member: Member) => (
        <button
          onClick={() => handleViewDetails(member.id)}
          className="px-3 py-1.5 text-white rounded-md text-sm font-medium transition-colors"
          style={{ backgroundColor: "#8ED7FF" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#7BC8F0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#8ED7FF")
          }
        >
          활동 상세보기
        </button>
      ),
    },
    {
      key: "adminActions",
      label: "관리자 작업",
      render: (value: any, member: Member) => renderAdminActions(member),
    },
  ];

  return (
    <div className="p-6 flex-1">
      <AdminLayout title="사용자 관리">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              총 사용자 수:{" "}
              <span className="font-medium text-gray-900">{totalUsers}</span>명
            </div>
          </div>
          <SearchFilter
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="사용자명 또는 이메일로 검색하세요"
          />
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
      </AdminLayout>
    </div>
  );
}
