/**
 * Markdown File Reader Utility
 * .md 파일 업로드 및 드래그앤드롭을 위한 파일 읽기 유틸리티
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MARKDOWN_EXTENSIONS = [".md", ".markdown"];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 파일이 마크다운 파일인지 확인
 */
export function isMarkdownFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return MARKDOWN_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

/**
 * 마크다운 파일 유효성 검증
 */
export function validateMarkdownFile(file: File): FileValidationResult {
  // 확장자 검증
  if (!isMarkdownFile(file)) {
    return {
      valid: false,
      error: "마크다운 파일(.md, .markdown)만 업로드할 수 있습니다.",
    };
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "파일 크기는 10MB 이하여야 합니다.",
    };
  }

  return { valid: true };
}

/**
 * 마크다운 파일 내용 읽기
 */
export async function readMarkdownFile(file: File): Promise<string> {
  const validation = validateMarkdownFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
      }
    };

    reader.onerror = () => {
      reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
    };

    reader.readAsText(file, "utf-8");
  });
}
