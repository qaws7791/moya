export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  color:
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  emoji: string;
}

export const tools: Tool[] = [
  {
    id: "markdown-cleaner",
    name: "Markdown Cleaner",
    description:
      "AI가 생성한 마크다운에서 불필요한 서식을 제거하고 깔끔하게 정리합니다.",
    href: "/tool/markdown-cleaner",
    color: "primary",
    emoji: "🧹",
  },
  {
    id: "korean-markdown-fixer",
    name: "Korean Markdown Fixer",
    description:
      "한국어 조사/어미로 인해 깨지는 마크다운 강조 구문을 자동으로 교정합니다.",
    href: "/tool/korean-markdown-fixer",
    color: "secondary",
    emoji: "🇰🇷",
  },
  {
    id: "filename-sanitizer",
    name: "Filename Sanitizer",
    description:
      "텍스트에서 OS가 허용하지 않는 문자를 제거하여 안전한 파일 이름을 만듭니다.",
    href: "/tool/filename-sanitizer",
    color: "accent",
    emoji: "🗂️",
  },
];
