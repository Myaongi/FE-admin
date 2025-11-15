# 강아지킴이 관리자 대시보드

강아지 실종/발견 게시물 관리 시스템의 관리자 대시보드입니다. Next.js 15와 React 19를 기반으로 구축되었습니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [환경 설정](#환경-설정)
- [주요 페이지](#주요-페이지)
- [API 구조](#api-구조)
- [주요 컴포넌트](#주요-컴포넌트)

## 프로젝트 개요

강아지킴이 관리자 대시보드는 실종/발견 게시물 플랫폼의 관리자용 웹 애플리케이션입니다. 관리자는 이 대시보드를 통해 사용자, 게시물, 신고 내역을 관리할 수 있습니다.

### 주요 특징

- 🔐 JWT 기반 인증 시스템
- 📊 실시간 데이터 조회 및 관리
- 🎨 반응형 디자인 (모바일/데스크톱 지원)
- 🔍 검색 및 필터링 기능
- 📄 페이지네이션 지원
- 🗑️ 게시물 및 사용자 삭제 기능
- ⚠️ 신고 내역 관리 및 처리

## 주요 기능

### 1. 사용자 관리 (`/admin/members`)

- **사용자 목록 조회**: 전체 사용자 목록을 페이지네이션과 함께 조회
- **검색 기능**: 사용자명 또는 이메일로 검색
- **상태 관리**: 계정 활성화/비활성화 처리
- **계정 삭제**: 사용자 계정 삭제 기능
- **상세 정보**: 사용자 활동 상세 정보 모달

### 2. 게시물 관리 (`/admin/posts`)

- **게시물 목록 조회**: 전체/발견했어요/잃어버렸어요 게시물 필터링
- **AI 이미지 필터**: AI 생성 이미지 게시물만 조회
- **게시물 삭제**: 부적절한 게시물 삭제 기능
- **상세 정보**: 게시물 상세 정보 모달 (강아지 정보, 위치 정보 포함)
- **지도 연동**: Google Maps를 통한 위치 정보 표시

### 3. 신고 내역 관리 (`/admin/reports`)

- **신고 목록 조회**: 전체 신고 내역 조회
- **신고 상세보기**: 신고 사유 및 상세 정보 확인
- **게시물 연동**: 신고된 게시물 바로 확인
- **처리 기능**:
  - 신고 무시 처리
  - 신고된 게시물 삭제

### 4. 인증 시스템 (`/login`)

- **로그인**: 이메일/비밀번호 기반 로그인
- **토큰 관리**: JWT 토큰 기반 인증
- **자동 리다이렉트**: 미인증 시 로그인 페이지로 자동 이동
- **세션 관리**: 로컬 스토리지를 통한 세션 유지

## 기술 스택

### 프론트엔드

- **Framework**: Next.js 15.5.6 (App Router)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.0
- **HTTP Client**: Axios 1.12.2
- **UI Components**:
  - @headlessui/react 2.2.9
  - @heroicons/react 2.2.0
- **Maps**: @react-google-maps/api 2.20.7

### 개발 도구

- **Linting**: ESLint 9
- **Build Tool**: Turbopack (Next.js 내장)
- **Package Manager**: npm/yarn

## 프로젝트 구조

```
fe-admin/
├── src/
│   ├── app/                      # Next.js App Router 페이지
│   │   ├── admin/              # 관리자 페이지
│   │   │   ├── members/        # 사용자 관리
│   │   │   ├── posts/          # 게시물 관리
│   │   │   ├── reports/        # 신고 내역 관리
│   │   │   ├── layout.tsx      # 관리자 레이아웃
│   │   │   └── page.tsx        # 관리자 메인 (리다이렉트)
│   │   ├── api/                # API 라우트 (프록시)
│   │   │   ├── admin/          # 관리자 API
│   │   │   └── auth/           # 인증 API
│   │   ├── login/              # 로그인 페이지
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   └── page.tsx            # 홈 페이지
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── badge/              # 상태 배지 컴포넌트
│   │   ├── filters/            # 필터 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── tables/             # 테이블 컴포넌트
│   │   ├── tabs/               # 탭 컴포넌트
│   │   ├── ui/                 # UI 컴포넌트
│   │   ├── AiToggle.tsx        # AI 필터 토글
│   │   ├── FilterButtons.tsx   # 게시물 타입 필터
│   │   ├── MembersDetailModal.tsx
│   │   ├── PostDetailModal.tsx
│   │   ├── PostsTable.tsx
│   │   ├── ReportDetailModal.tsx
│   │   └── Sidebar.tsx
│   └── lib/                    # 유틸리티 및 설정
│       ├── api-client.ts       # API 클라이언트
│       ├── url-utils.ts        # URL 유틸리티
│       └── mock/               # 목업 데이터
├── public/                     # 정적 파일
├── next.config.js              # Next.js 설정
├── tailwind.config.js          # Tailwind CSS 설정
└── package.json                # 프로젝트 의존성
```

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
# 또는
yarn install
```

### 개발 서버 실행

```bash
# 개발 서버 시작 (Turbopack 사용)
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build
# 또는
yarn build

# 프로덕션 서버 시작
npm start
# 또는
yarn start
```

## 환경 설정

### 백엔드 서버 설정

프로젝트는 외부 백엔드 서버(`http://54.180.54.51:8080`)와 통신합니다.

`next.config.js`에서 API 프록시 설정을 확인할 수 있습니다:

```javascript
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://54.180.54.51:8080/api/:path*",
    },
  ];
}
```

### 환경 변수

개발 환경에서 목업 데이터를 사용하려면 환경 변수를 설정하세요:

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK=true
```

### 이미지 도메인 설정

S3 이미지를 표시하기 위해 `next.config.js`에 이미지 도메인이 설정되어 있습니다:

```javascript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "gangajikimi-server.s3.ap-northeast-2.amazonaws.com",
      pathname: "/**",
    },
  ],
}
```

## 주요 페이지

### 로그인 페이지 (`/login`)

- 이메일/비밀번호 입력
- JWT 토큰 발급 및 저장
- 로그인 성공 시 `/admin/members`로 리다이렉트

### 사용자 관리 (`/admin/members`)

- 사용자 목록 테이블
- 검색 기능 (사용자명/이메일)
- 페이지네이션 (기본 20개/페이지)
- 계정 상태 변경 (활성화/비활성화)
- 계정 삭제
- 사용자 상세 정보 모달

### 게시물 관리 (`/admin/posts`)

- 게시물 목록 테이블
- 필터: 전체/발견했어요/잃어버렸어요
- AI 이미지 필터 토글
- 게시물 삭제
- 게시물 상세 정보 모달:
  - 게시물 정보 탭
  - 강아지 정보 탭
  - 위치 정보 탭 (Google Maps)

### 신고 내역 관리 (`/admin/reports`)

- 신고 목록 테이블
- 신고 사유, 신고자, 신고일 표시
- 신고 상태 배지
- 신고 상세보기 모달
- 신고된 게시물 바로가기
- 관리자 작업:
  - 신고 무시 처리
  - 신고된 게시물 삭제

## API 구조

### 인증 API

- `POST /api/auth/login` - 로그인

### 관리자 API

#### 사용자 관리

- `GET /api/admin/members` - 사용자 목록 조회
- `GET /api/admin/members/[id]` - 사용자 상세 조회
- `PATCH /api/admin/members/[id]/status` - 사용자 상태 변경
- `DELETE /api/admin/members/[id]` - 사용자 삭제

#### 게시물 관리

- `GET /api/admin/posts` - 게시물 목록 조회
- `GET /api/admin/posts/[type]/[id]` - 게시물 상세 조회
- `DELETE /api/admin/posts/[type]/[id]/delete` - 게시물 삭제

#### 신고 내역 관리

- `GET /api/admin/reports` - 신고 목록 조회
- `GET /api/admin/reports/[type]/[reportId]` - 신고 상세 조회
- `PATCH /api/admin/reports/[type]/[reportId]/ignore` - 신고 무시 처리
- `DELETE /api/admin/reports/[type]/[reportId]/delete` - 신고된 게시물 삭제

### API 클라이언트

`src/lib/api-client.ts`에서 API 클라이언트를 관리합니다:

- `apiClient`: 실제 서버와 통신 (게시물, 신고 관리)
- `mockApiClient`: 목업 데이터 사용 (사용자 관리)

## 주요 컴포넌트

### 레이아웃 컴포넌트

- **Sidebar**: 사이드바 네비게이션 메뉴
- **AdminHeader**: 상단 헤더 (사이드바 토글, 사용자 정보, 로그아웃)

### 테이블 컴포넌트

- **AdminTable**: 범용 관리자 테이블
- **PostsTable**: 게시물 전용 테이블
- **TablePagination**: 페이지네이션 컴포넌트

### 모달 컴포넌트

- **MembersDetailModal**: 사용자 상세 정보 모달
- **PostDetailModal**: 게시물 상세 정보 모달 (탭 구조)
- **ReportDetailModal**: 신고 상세 정보 모달

### 필터 컴포넌트

- **FilterButtons**: 게시물 타입 필터 (전체/발견/실종)
- **SearchFilter**: 검색 입력 필터
- **AiToggle**: AI 이미지 필터 토글

### 배지 컴포넌트

- **ActivityBadge**: 사용자 활동 상태 배지
- **StatusBadge**: 일반 상태 배지
- **ReportStatusBadge**: 신고 상태 배지

## 인증 및 보안

- JWT 토큰 기반 인증
- 로컬 스토리지에 토큰 저장
- API 요청 시 Authorization 헤더에 토큰 포함
- 토큰 만료 시 자동 로그아웃 및 로그인 페이지 리다이렉트
- 관리자 페이지 접근 시 인증 확인

## 스타일링

- Tailwind CSS를 사용한 유틸리티 기반 스타일링
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 다크 모드는 미지원 (향후 추가 가능)

## 개발 팁

### 목업 데이터 사용

개발 중 백엔드 서버가 없을 때 목업 데이터를 사용할 수 있습니다:

1. `.env.local` 파일 생성
2. `NEXT_PUBLIC_USE_MOCK=true` 설정
3. 개발 서버 재시작

### 디버깅

- 브라우저 콘솔에서 API 요청/응답 로그 확인
- 네트워크 탭에서 실제 HTTP 요청 확인
- Next.js 서버 콘솔에서 서버 사이드 로그 확인

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 문의

프로젝트 관련 문의사항이 있으시면 개발팀에 연락해주세요.
