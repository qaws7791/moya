/**
 * Microsoft 3D Fluent Emoji의 CDN URL을 생성하는 유틸리티입니다.
 * 별도의 라이브러리(React 의존성 등) 없이 순수 자바스크립트로 구현하여 프로젝트를 가볍게 유지합니다.
 */

export type EmojiStyle = "3d" | "flat" | "modern" | "mono";

/**
 * 이모지 문자열을 유니코드 문자열로 변환합니다. (예: 🧹 -> 1f4b9)
 */
export function emojiToUnicode(emoji: string): string {
  return Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");
}

/**
 * 3D Fluent Emoji의 CDN URL을 반환합니다.
 * LobeHub의 CDN 인프라를 활용하되, 라이브러리 의존성 없이 처리합니다.
 */
export function getFluentEmojiUrl(
  emoji: string,
  style: EmojiStyle = "3d",
): string {
  const unicode = emojiToUnicode(emoji);
  const ext = style === "3d" ? "webp" : "svg";
  const pkg = `@lobehub/fluent-emoji-${style}`;

  // 압축된 WebP 또는 SVG 파일을 제공하는 CDN 경로 (npmmirror가 안정적이고 빠름)
  return `https://registry.npmmirror.com/${pkg}/latest/files/assets/${unicode}.${ext}`;
}
