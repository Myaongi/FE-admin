/**
 * URL 유틸리티 함수들
 */

/**
 * URL에서 슬래시 중복을 제거합니다.
 * http://example.com//api//users -> http://example.com/api/users
 * @param url - 정리할 URL
 * @returns 슬래시 중복이 제거된 URL
 */
export function normalizeUrl(url: string): string {
  if (!url) return url;
  return url.replace(/([^:]\/)\/+/g, "$1");
}

/**
 * baseURL과 endpoint를 안전하게 결합합니다.
 * @param baseUrl - 기본 URL
 * @param endpoint - 엔드포인트 경로
 * @returns 정규화된 완전한 URL
 */
export function combineUrl(baseUrl: string, endpoint: string): string {
  if (!baseUrl) return endpoint;
  if (!endpoint) return baseUrl;

  const combined = `${baseUrl}${endpoint}`;
  return normalizeUrl(combined);
}

/**
 * 이미지 URL을 정규화합니다.
 * @param imageUrl - 이미지 URL
 * @returns 정규화된 이미지 URL
 */
export function normalizeImageUrl(imageUrl: string): string {
  return normalizeUrl(imageUrl);
}

/**
 * S3 이미지 URL을 안전하게 처리합니다.
 * PresignedURL이면 그대로 사용하고, 상대경로면 S3 URL로 변환합니다.
 * @param path - 이미지 경로 (PresignedURL 또는 상대경로)
 * @returns 처리된 이미지 URL
 */
export function getImageUrl(path?: string | null): string | null {
  if (!path) return null;

  // PresignedURL이면 그대로 사용
  if (path.startsWith("http")) {
    return normalizeUrl(path);
  }

  // 상대경로면 S3 URL로 변환
  const cleanPath = path.replace(/^\/+/, "");
  const s3Url = `https://gangajikimi-server.s3.ap-northeast-2.amazonaws.com/${cleanPath}`;
  return normalizeUrl(s3Url);
}
