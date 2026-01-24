import type { CleanerOptions } from "./types";

export interface FormatOption {
  key: keyof CleanerOptions;
  label: string;
}

export interface FormatGroup {
  label: string;
  options: FormatOption[];
}

export const formatGroups: FormatGroup[] = [
  {
    label: "블록",
    options: [
      { key: "removeHeading", label: "제목" },
      { key: "removeBlockquote", label: "인용문" },
      { key: "removeCode", label: "코드블록" },
      { key: "removeList", label: "목록" },
      { key: "removeTable", label: "테이블" },
      { key: "removeThematicBreak", label: "구분선 (HR)" },
    ],
  },
  {
    label: "인라인",
    options: [
      { key: "removeEmphasis", label: "강조 (Italic)" },
      { key: "removeStrong", label: "굵게 (Bold)" },
      { key: "removeInlineCode", label: "인라인 코드" },
      { key: "removeLink", label: "링크" },
      { key: "removeImage", label: "이미지" },
      { key: "removeDelete", label: "취소선" },
    ],
  },
  {
    label: "기타",
    options: [
      { key: "removeHtml", label: "HTML" },
      { key: "removeFootnote", label: "각주" },
      { key: "removeBreak", label: "줄바꿈" },
    ],
  },
];
