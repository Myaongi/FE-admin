"use client";
import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
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

interface LocationInfoTabProps {
  postDetail: PostDetail;
  formatDate: (dateArray: number[] | undefined) => string;
  formatTime: (dateArray: number[] | undefined) => string;
}

export default function LocationInfoTab({
  postDetail,
  formatDate,
  formatTime,
}: LocationInfoTabProps) {
  const [mapOpen, setMapOpen] = useState(false);

  const center = useMemo(
    () => ({ lat: postDetail.latitude, lng: postDetail.longitude }),
    [postDetail.latitude, postDetail.longitude]
  );

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMapOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mapOpen]);

  return (
    <div className="space-y-6">
      {/* 위치 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          {postDetail.type === "LOST" ? "실종 정보" : "발견 정보"}
        </h4>
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
        {/* preview iframe */}
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <iframe
            title="map-preview"
            width="100%"
            height="240"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${postDetail.latitude},${postDetail.longitude}&z=15&output=embed`}
          />
        </div>
        <div>
          <button
            type="button"
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
            onClick={() => setMapOpen(true)}
          >
            지도 확대보기
          </button>
        </div>
      </div>

      {mapOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          onClick={() => setMapOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-100">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ position: "absolute", inset: 0 }}
                  center={center}
                  zoom={15}
                  options={{ disableDefaultUI: true, clickableIcons: false }}
                >
                  <Marker
                    position={center}
                    icon={
                      typeof window !== "undefined" && (window as any).google
                        ? {
                            url: "/paw-marker.svg",
                            scaledSize: new (window as any).google.maps.Size(
                              48,
                              48
                            ),
                            anchor: new (window as any).google.maps.Point(
                              24,
                              24
                            ),
                          }
                        : undefined
                    }
                  />

                  {/* 발자국과 함께 움직이는 정보 오버레이 */}
                  <Marker
                    position={{
                      lat: center.lat + 0.001, // 마커 오른쪽에 위치
                      lng: center.lng + 0.001,
                    }}
                    icon={{
                      url:
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(`
                          <svg width="200" height="70" viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.4)"/>
                              </filter>
                            </defs>
                            <rect x="0" y="0" width="200" height="70" rx="8" fill="rgba(0,0,0,0.8)" stroke="none" filter="url(#cardShadow)"/>
                            <text x="10" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#FFABBF">
                              ${
                                postDetail.status === "실종"
                                  ? "최초 실종"
                                  : "발견"
                              }
                            </text>
                            <text x="10" y="40" font-family="Arial, sans-serif" font-size="12" font-weight="500" fill="white">
                              ${postDetail.region}
                            </text>
                            <text x="10" y="58" font-family="Arial, sans-serif" font-size="12" font-weight="400" fill="white">
                              ${formatDate(
                                postDetail.eventDateTime
                              )} ${formatTime(postDetail.eventDateTime)}
                            </text>
                          </svg>
                        `),
                      scaledSize: new (window as any).google.maps.Size(200, 70),
                      anchor: new (window as any).google.maps.Point(0, 35),
                    }}
                  />
                </GoogleMap>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  지도를 불러오는 중...
                </div>
              )}
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="button"
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                onClick={() => setMapOpen(false)}
              >
                닫기 (ESC)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
