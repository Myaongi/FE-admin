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

interface DogTabProps {
  postDetail: PostDetail;
  getGenderText: (gender: string | undefined) => string;
}

export default function DogTab({ postDetail, getGenderText }: DogTabProps) {
  return (
    <div className="space-y-6">
      {/* 강아지 기본 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          강아지 기본 정보
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              품종
            </label>
            <div className="text-gray-900">{postDetail.breed}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              색상
            </label>
            <div className="text-gray-900">{postDetail.color}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              성별
            </label>
            <div className="text-gray-900">
              {getGenderText(postDetail.gender)}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 mb-4">상세 정보</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-900 leading-relaxed">
            {postDetail.description}
          </p>
        </div>
      </div>

      {/* 강아지 사진 */}
      {(postDetail.aiImage || postDetail.realImages.length > 0) && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-900 mb-4">강아지 사진</h4>
          <div className="space-y-4">
            {postDetail.aiImage && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    AI 생성
                  </span>
                </div>
                <div className="relative w-full h-64 sm:h-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={postDetail.aiImage}
                    alt="AI 생성 이미지"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    대표 사진
                  </div>
                </div>
              </div>
            )}
            {postDetail.realImages.map((image, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    실제 사진
                  </span>
                </div>
                <div className="relative w-full h-64 sm:h-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={image}
                    alt={`실제 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
