import type { SanitizeOptions, SanitizeResult } from "./types";

/** Windows에서 금지된 문자 */
const WINDOWS_FORBIDDEN = new Set([
  "\\",
  "/",
  ":",
  "*",
  "?",
  '"',
  "<",
  ">",
  "|",
]);

/** Linux에서 금지된 문자 (슬래시만, NUL은 제어문자로 처리) */
const LINUX_FORBIDDEN = new Set(["/"]);

/** macOS에서 금지된 문자 */
const MAC_FORBIDDEN = new Set(["/", ":"]);

/** Windows 예약된 파일명 (대소문자 무시) */
const WINDOWS_RESERVED_NAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM0",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT0",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

function isControlChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x00 && code <= 0x1f;
}

export function sanitizeFilename(
  input: string,
  options: SanitizeOptions,
): SanitizeResult {
  if (!input) {
    return { sanitized: "", removedChars: [], warnings: [] };
  }

  const { os, advanced } = options;

  // 제거할 금지 문자 집합 조합
  const forbidden = new Set<string>();
  if (os.windows) WINDOWS_FORBIDDEN.forEach((c) => forbidden.add(c));
  if (os.linux) LINUX_FORBIDDEN.forEach((c) => forbidden.add(c));
  if (os.mac) MAC_FORBIDDEN.forEach((c) => forbidden.add(c));

  const needsControlFilter = os.windows || os.linux || os.mac;
  const removedSet = new Set<string>();

  let result = "";

  for (const char of input) {
    if (needsControlFilter && isControlChar(char)) {
      removedSet.add(char);
      continue;
    }

    if (forbidden.has(char)) {
      removedSet.add(char);
      continue;
    }

    result += char;
  }

  // 공백 대체
  if (advanced.replaceSpacesWith !== null) {
    result = result.split(" ").join(advanced.replaceSpacesWith);
  }

  // 소문자 변환
  if (advanced.lowercase) {
    result = result.toLowerCase();
  }

  // 앞뒤 점/공백 제거
  if (advanced.trimDotsAndSpaces) {
    result = result.replace(/^[\s.]+|[\s.]+$/g, "");
  }

  // 최대 길이 제한
  if (advanced.maxLength !== null && result.length > advanced.maxLength) {
    result = result.slice(0, advanced.maxLength);
  }

  // Windows 예약된 이름 경고
  const warnings: string[] = [];
  if (os.windows) {
    const nameWithoutExt = result.split(".")[0].toUpperCase();
    if (WINDOWS_RESERVED_NAMES.has(nameWithoutExt)) {
      warnings.push(
        `"${nameWithoutExt}"는 Windows에서 예약된 파일명입니다. 다른 이름을 사용하세요.`,
      );
    }
  }

  return {
    sanitized: result,
    removedChars: Array.from(removedSet),
    warnings,
  };
}
