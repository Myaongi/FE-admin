"use client";

interface PostDetail {
  postId: number;
  type: "LOST" | "FOUND";
  status: string;
  title: string;
  authorName: string;
  createdAt: number[];
  region: string;
  aiImage: string | null;
  realImages: string[];
  dogName?: string | null; // LOST만 값 존재
  breed: string;
  color: string;
  gender: "MALE" | "FEMALE";
  description: string;
  eventDateTime: number[];
  latitude: number;
  longitude: number;
}

import StatusBadge from "../badge/StatusBadge";

interface PostTabProps {
  postDetail: PostDetail;
  formatDate: (dateArray: number[] | undefined) => string;
  formatTime: (dateArray: number[] | undefined) => string;
}

export default function PostTab({
  postDetail,
  formatDate,
  formatTime,
}: PostTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            제목
          </label>
          <div className="text-gray-900 font-medium">{postDetail.title}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            카테고리
          </label>
          <div className="text-gray-900">
            {postDetail.type === "LOST" ? "잃어버렸어요" : "발견했어요"}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            작성자
          </label>
          <div className="text-gray-900">{postDetail.authorName}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            작성일
          </label>
          <div className="text-gray-900">
            {formatDate(postDetail.createdAt)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            작성시간
          </label>
          <div className="text-gray-900">
            {formatTime(postDetail.createdAt)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            상태
          </label>
          <div>
            <StatusBadge status={postDetail.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
