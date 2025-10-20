"use client";

interface PostDetail {
  postId: number;
  type: "LOST";
  status: string;
  title: string;
  authorName: string;
  createdAt: number[];
  region: string;
  aiImage: string | null;
  realImages: string[];
  dogName: string;
  breed: string;
  color: string;
  gender: "MALE" | "FEMALE";
  description: string;
  eventDateTime: number[];
  latitude: number;
  longitude: number;
}

interface FoundTabProps {
  postDetail: PostDetail;
  formatDate: (dateArray: number[] | undefined) => string;
  formatTime: (dateArray: number[] | undefined) => string;
}

export default function FoundTab({
  postDetail,
  formatDate,
  formatTime,
}: FoundTabProps) {
  return (
    <div className="space-y-6">
      {/* 발견 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 mb-4">발견 정보</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              날짜
            </label>
            <div className="text-gray-900">
              {formatDate(postDetail.eventDateTime)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              시간
            </label>
            <div className="text-gray-900">
              {formatTime(postDetail.eventDateTime)}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              상세 위치
            </label>
            <div className="text-gray-900">{postDetail.region}</div>
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 mb-4">위치</h4>
        <div className="bg-gray-100 rounded-lg h-64 sm:h-48 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📍</div>
            <div className="text-sm">Google Maps</div>
            <div className="text-xs text-gray-400 mt-1">
              {postDetail.latitude.toFixed(6)},{" "}
              {postDetail.longitude.toFixed(6)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
