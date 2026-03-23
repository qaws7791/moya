export interface OsOptions {
  windows: boolean;
  linux: boolean;
  mac: boolean;
}

export interface AdvancedOptions {
  /** 공백을 대체할 문자. null이면 대체하지 않음 */
  replaceSpacesWith: "_" | "-" | "" | null;
  /** 최대 파일명 길이. null이면 제한 없음 */
  maxLength: number | null;
  /** 소문자로 변환 여부 */
  lowercase: boolean;
  /** 앞뒤 점(.) 및 공백 제거 여부 */
  trimDotsAndSpaces: boolean;
}

export interface SanitizeOptions {
  os: OsOptions;
  advanced: AdvancedOptions;
}

export interface SanitizeResult {
  /** 정리된 파일명 */
  sanitized: string;
  /** 제거된 문자 목록 (중복 제거) */
  removedChars: string[];
  /** Windows 예약된 이름 경고 */
  warnings: string[];
}

export const DEFAULT_OS_OPTIONS: OsOptions = {
  windows: true,
  linux: true,
  mac: true,
};

export const DEFAULT_ADVANCED_OPTIONS: AdvancedOptions = {
  replaceSpacesWith: null,
  maxLength: null,
  lowercase: false,
  trimDotsAndSpaces: false,
};

export const DEFAULT_SANITIZE_OPTIONS: SanitizeOptions = {
  os: DEFAULT_OS_OPTIONS,
  advanced: DEFAULT_ADVANCED_OPTIONS,
};
