'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import PostDetailModal from '../components/PostDetailModal';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'FOUND' | 'LOST'>('ALL');
  const [aiOnly, setAiOnly] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDetailClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  // API 호출 함수
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      // 실제 환경에서는 localStorage나 쿠키에서 토큰을 가져와야 합니다
      const accessToken = localStorage.getItem('accessToken') || 'mock-token';

      const response = await axios.get('/api/admin/posts', {
        params: {
          type: filter,
          aiOnly: aiOnly,
          page: 0,
          size: 20
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      if (response.data.success) {
        const data = response.data.result.content;
        setPosts(data);
      } else {
        throw new Error(response.data.error || 'API 응답 오류');
      }
    } catch (err: any) {
      console.error('API 호출 오류:', err);

      // 에러 메시지 설정
      if (err.response?.status === 404) {
        setError('API 엔드포인트를 찾을 수 없습니다.');
      } else if (err.response?.status === 401) {
        setError('인증이 필요합니다.');
      } else if (err.response?.status === 500) {
        setError('서버 오류가 발생했습니다.');
      } else {
        setError('게시글을 불러오는데 실패했습니다.');
      }

      // 에러 발생 시 빈 배열로 설정
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 필터 또는 AI 토글 변경 시 API 호출
  useEffect(() => {
    fetchPosts();
  }, [filter, aiOnly]);

  // 소제목 동적 변경
  const getCardTitle = () => {
    if (filter === 'ALL') return '전체 게시물 목록';
    if (filter === 'FOUND') return '발견했어요 게시물 목록';
    if (filter === 'LOST') return '잃어버렸어요 게시물 목록';
    return '전체 게시물 목록';
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    const statusMap = {
      '실종': { text: '실종', className: 'missing' },
      '발견': { text: '발견', className: 'found' },
      '귀가 완료': { text: '귀가 완료', className: 'returned' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, className: 'missing' };

    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  // 모바일에서 사이드바 자동 닫힘
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // 초기 로드 시 체크
    handleResize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="app-brand">
            <div className="app-icon"></div>
            <div className="app-title">
              <h1>강아지킴이</h1>
              <p>Admin Dashboard</p>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <nav className="sidebar-menu">
            <div className="menu-item">
              <div className="menu-icon"></div>
              <span>데이터 분석 및 통계</span>
            </div>
            <div className="menu-item">
              <div className="menu-icon"></div>
              <span>사용자 관리</span>
            </div>
            <div className="menu-item active">
              <div className="menu-icon"></div>
              <span>게시물 관리</span>
            </div>
            <div className="menu-item">
              <div className="menu-icon"></div>
              <span>신고 내역</span>
            </div>
            <div className="menu-item">
              <div className="menu-icon"></div>
              <span>AI 매칭</span>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <div className="menu-icon"></div>
            </button>
            <div className="user-info">
              <div className="user-avatar"></div>
              <h2>강아지킴이 관리자</h2>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <div className="page-header">
            <h1>게시물 관리</h1>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>{getCardTitle()}</h3>
            </div>

            <div className="filters">
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilter('ALL')}
                >
                  전체
                </button>
                <button
                  className={`filter-btn ${filter === 'FOUND' ? 'active' : ''}`}
                  onClick={() => setFilter('FOUND')}
                >
                  발견했어요
                </button>
                <button
                  className={`filter-btn ${filter === 'LOST' ? 'active' : ''}`}
                  onClick={() => setFilter('LOST')}
                >
                  잃어버렸어요
                </button>
              </div>

              <div className="ai-toggle">
                <div
                  className={`toggle-switch ${aiOnly ? 'active' : ''}`}
                  onClick={() => setAiOnly(!aiOnly)}
                >
                  <div className="toggle-slider"></div>
                </div>
                <span>AI 이미지 생성 게시물만 보기</span>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="posts-table">
                <thead>
                  <tr>
                    <th>상태</th>
                    <th>대표사진</th>
                    <th>제목</th>
                    <th>username</th>
                    <th>작성일</th>
                    <th>위치</th>
                    <th>상세보기</th>
                    <th>관리자 작업</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                        로딩 중...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                        {error}
                      </td>
                    </tr>
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                        게시글이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.postId}>
                        <td>
                          {renderStatusBadge(post.status)}
                        </td>
                        <td>
                          <div className="post-image"></div>
                        </td>
                        <td>{post.title}</td>
                        <td>{post.authorName}</td>
                        <td>{`${post.createdAt[0]}-${post.createdAt[1]}-${post.createdAt[2]}`}</td>
                        <td>{post.region}</td>
                        <td>
                          <button
                            className="detail-btn"
                            onClick={() => handleDetailClick(post.postId)}
                          >
                            상세보기
                          </button>
                        </td>
                        <td>
                          <button className="delete-btn">삭제</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 상세보기 모달 */}
      <PostDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        postId={selectedPostId}
      />

    </div>
  );
}