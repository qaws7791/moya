# Markdown Cleaner - 구현 계획서

## 📋 개요

AI(Gemini, Claude, ChatGPT 등)가 생성한 마크다운 문서에서 **특정 서식을 선택적으로 제거**하는 웹 기반 도구입니다.

### 핵심 요구사항
- 마크다운의 모든 서식을 개별 또는 다중 선택하여 제거 가능
- 10만자 이상의 대용량 문서도 멈춤 없이 처리
- 심플하고 직관적인 UI (상단: 서식 선택, 좌측: 입력, 우측: 결과)

---

## 🛠️ 기술 스택

### 마크다운 파싱 라이브러리: **Unified + Remark 생태계**

| 패키지 | 용도 |
|--------|------|
| `unified` | 텍스트 처리 파이프라인 코어 |
| `remark-parse` | 마크다운 → AST(mdast) 파싱 |
| `remark-stringify` | AST(mdast) → 마크다운 직렬화 |
| `remark-gfm` | GFM(GitHub Flavored Markdown) 지원 |
| `unist-util-visit` | AST 노드 순회 및 조작 |

**선정 이유:**
1. **신뢰성**: Unified 생태계는 High reputation, 풍부한 코드 스니펫(remark: 39개, remark-gfm: 11개)
2. **브라우저 호환성**: ESM 지원, 브라우저에서 직접 import 가능
3. **AST 조작**: 노드 타입별로 정밀하게 제거 가능 (visit 함수 사용)
4. **GFM 지원**: 테이블, 취소선, 각주 등 확장 문법 처리

---

## 📐 아키텍처 설계

### 폴더 구조
```
src/modules/markdown-cleaner/
├── core/                      # 순수 비즈니스 로직 (프레임워크 독립)
│   ├── types.ts               # 타입 정의
│   ├── cleaner.ts             # 마크다운 클리너 핵심 로직
│   ├── cleaner.test.ts        # TDD 테스트
│   └── format-options.ts      # 서식 옵션 정의 및 매핑
├── components/                # SolidJS UI 컴포넌트
│   ├── markdown-cleaner.tsx   # 메인 위젯 컴포넌트
│   ├── format-selector.tsx    # 서식 선택 UI
│   ├── input-panel.tsx        # 입력 패널
│   └── output-panel.tsx       # 출력 패널
└── index.ts                   # 공개 진입점
```

### 레이어 분리
```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (SolidJS)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │FormatSelector│ │  InputPanel  │ │ OutputPanel  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Core Layer (Pure Functions)                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               cleanMarkdown(input, options)             ││
│  │  - Parse: md → AST (remark-parse)                       ││
│  │  - Transform: Remove nodes (unist-util-visit)           ││
│  │  - Stringify: AST → md (remark-stringify)               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 제거 가능한 마크다운 서식 (mdast 노드 타입)

### 블록 레벨
| 서식 | 노드 타입 | 설명 | 예시 |
|------|-----------|------|------|
| 제목 | `heading` | h1~h6 제목 | `# Heading` |
| 인용문 | `blockquote` | 인용구 블록 | `> quote` |
| 코드 블록 | `code` | 펜스 코드 블록 | ` ```js ``` ` |
| 목록 | `list` | 순서/비순서 목록 | `- item`, `1. item` |
| 구분선 | `thematicBreak` | 수평선 | `---` |
| 테이블 (GFM) | `table` | 표 | `| a | b |` |

### 인라인 레벨
| 서식 | 노드 타입 | 설명 | 예시 |
|------|-----------|------|------|
| 강조 (이탤릭) | `emphasis` | 기울임체 | `*italic*` |
| 굵게 | `strong` | 볼드체 | `**bold**` |
| 인라인 코드 | `inlineCode` | 인라인 코드 | `` `code` `` |
| 링크 | `link` | 하이퍼링크 | `[text](url)` |
| 이미지 | `image` | 이미지 | `![alt](src)` |
| 취소선 (GFM) | `delete` | 취소선 | `~~strike~~` |
| 줄바꿈 | `break` | 강제 줄바꿈 | `line<br>break` |

### 참조 정의
| 서식 | 노드 타입 | 설명 | 예시 |
|------|-----------|------|------|
| 링크 참조 | `linkReference` | 참조 링크 | `[text][ref]` |
| 이미지 참조 | `imageReference` | 참조 이미지 | `![alt][ref]` |
| 정의 | `definition` | 참조 정의 | `[ref]: url` |
| 각주 참조 (GFM) | `footnoteReference` | 각주 참조 | `[^1]` |
| 각주 정의 (GFM) | `footnoteDefinition` | 각주 정의 | `[^1]: note` |

### HTML
| 서식 | 노드 타입 | 설명 | 예시 |
|------|-----------|------|------|
| HTML | `html` | 인라인 HTML | `<div>...</div>` |

---

## 🔧 핵심 구현 로직

### 1. cleanMarkdown 함수
```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit, SKIP } from 'unist-util-visit';

export interface CleanerOptions {
  removeHeading?: boolean;
  removeEmphasis?: boolean;
  removeStrong?: boolean;
  removeLink?: boolean;
  removeImage?: boolean;
  removeCode?: boolean;
  removeInlineCode?: boolean;
  removeBlockquote?: boolean;
  removeList?: boolean;
  removeTable?: boolean;
  removeThematicBreak?: boolean;
  removeDelete?: boolean;
  removeHtml?: boolean;
  removeBreak?: boolean;
  removeFootnote?: boolean;
}

export async function cleanMarkdown(
  markdown: string,
  options: CleanerOptions
): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => (tree) => {
      visit(tree, (node, index, parent) => {
        // 옵션에 따라 노드 제거 또는 텍스트로 변환
      });
    })
    .use(remarkStringify);

  const result = await processor.process(markdown);
  return String(result);
}
```

### 2. 노드 제거 전략

**두 가지 방식:**
1. **완전 제거**: 노드 자체를 삭제 (예: 구분선, 테이블)
2. **언랩(Unwrap)**: 서식만 제거하고 텍스트 내용 보존 (예: 강조, 링크)

```typescript
// 예: 링크 제거 (텍스트는 보존)
if (node.type === 'link' && options.removeLink) {
  // [text](url) → text
  parent.children.splice(index, 1, ...node.children);
  return [SKIP, index];
}

// 예: 목록 제거 (내용물도 제거)
if (node.type === 'list' && options.removeList) {
  parent.children.splice(index, 1);
  return [SKIP, index];
}
```

---

## ⚡ 성능 최적화 전략

### 대용량 문서 처리 (10만자 이상)

1. **비동기 처리**: `async/await` 사용으로 메인 스레드 블로킹 방지
2. **디바운싱**: 입력 시 300ms 디바운스 적용
3. **프로그레시브 UI**: 처리 중 로딩 인디케이터 표시
4. **Web Worker 고려사항**: 
   - 초기 버전에서는 메인 스레드에서 처리
   - 성능 이슈 발생 시 Web Worker로 이전 가능 (unified는 브라우저 호환)

```typescript
// 디바운스 적용 예시
const debouncedClean = debounce(async (input: string) => {
  setLoading(true);
  const result = await cleanMarkdown(input, options);
  setOutput(result);
  setLoading(false);
}, 300);
```

---

## 🎨 UI 설계

### 레이아웃
```
┌─────────────────────────────────────────────────────────────────┐
│                        Format Selector                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ 전체 선택  ○ 전체 해제                                    ││
│  │ ┌─────────────────────────────────────────────────────────┐ ││
│  │ │ 블록: □ 제목 □ 인용문 □ 코드블록 □ 목록 □ 테이블 □ HR   │ ││
│  │ │ 인라인: □ 강조 □ 굵게 □ 코드 □ 링크 □ 이미지 □ 취소선  │ ││
│  │ │ 기타: □ HTML □ 각주                                     │ ││
│  │ └─────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                   Main Content Area (flex)                      │
│  ┌──────────────────────────┐ ┌──────────────────────────────┐  │
│  │      Input Panel         │ │      Output Panel            │  │
│  │  ┌────────────────────┐  │ │  ┌────────────────────────┐  │  │
│  │  │                    │  │ │  │                        │  │  │
│  │  │  Markdown Input    │  │ │  │   Cleaned Output       │  │  │
│  │  │  (textarea)        │  │ │  │   (readonly textarea)  │  │  │
│  │  │                    │  │ │  │                        │  │  │
│  │  └────────────────────┘  │ │  └────────────────────────┘  │  │
│  │  [붙여넣기] [지우기]     │ │  [복사하기] [다운로드]       │  │
│  └──────────────────────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### DaisyUI 컴포넌트 활용
- `checkbox` / `radio`: 서식 선택
- `textarea`: 입력/출력 영역
- `btn`: 액션 버튼들
- `card`: 패널 컨테이너
- `loading`: 처리 중 인디케이터

---

## 📝 TDD 테스트 계획

### Phase 1: Core 로직 테스트
- [ ] 1.1 빈 문자열 입력 시 빈 문자열 반환
- [ ] 1.2 옵션 없이 호출 시 원본 그대로 반환
- [ ] 1.3 단일 서식 제거 (emphasis)
- [ ] 1.4 단일 서식 제거 (strong)
- [ ] 1.5 단일 서식 제거 (link) - 텍스트 보존
- [ ] 1.6 단일 서식 제거 (image)
- [ ] 1.7 단일 서식 제거 (inlineCode)
- [ ] 1.8 단일 서식 제거 (code block)
- [ ] 1.9 단일 서식 제거 (heading) - 텍스트 보존
- [ ] 1.10 단일 서식 제거 (blockquote) - 내용 보존
- [ ] 1.11 단일 서식 제거 (list)
- [ ] 1.12 단일 서식 제거 (thematicBreak)
- [ ] 1.13 단일 서식 제거 (table)
- [ ] 1.14 단일 서식 제거 (delete/strikethrough)
- [ ] 1.15 단일 서식 제거 (html)
- [ ] 1.16 단일 서식 제거 (break)
- [ ] 1.17 단일 서식 제거 (footnote)

### Phase 2: 복합 테스트
- [ ] 2.1 다중 서식 동시 제거
- [ ] 2.2 중첩 서식 처리 (`***bold italic***`)
- [ ] 2.3 특수 문자 포함 텍스트 처리
- [ ] 2.4 GFM 확장 문법 처리

### Phase 3: 성능 테스트
- [ ] 3.1 대용량 문서(10만자) 처리 시간 측정
- [ ] 3.2 메모리 사용량 확인

### Phase 4: UI 테스트
- [ ] 4.1 서식 체크박스 토글 동작
- [ ] 4.2 전체 선택/해제 동작
- [ ] 4.3 입력 → 출력 실시간 반영
- [ ] 4.4 복사/붙여넣기 기능

---

## 📦 의존성 설치

```bash
pnpm add unified remark-parse remark-stringify remark-gfm unist-util-visit
pnpm add -D @types/mdast
```

---

## 🚀 구현 순서

1. **의존성 설치**
2. **타입 정의** (types.ts)
3. **Core 로직 TDD** (cleaner.ts, cleaner.test.ts)
   - 각 서식별 테스트 작성 → 구현 반복
4. **서식 옵션 매핑** (format-options.ts)
5. **UI 컴포넌트 구현** (SolidJS)
   - FormatSelector → InputPanel → OutputPanel → MarkdownCleaner
6. **Astro 페이지 연결**
7. **성능 최적화 및 마무리**

---

## ⚠️ 주의사항

1. **서식 제거 시 텍스트 보존 여부**를 명확히 구분
   - 보존: heading, emphasis, strong, link, blockquote, delete
   - 삭제: image, code, table, thematicBreak, html, footnote
2. **AST 변환 중 index 관리**: splice 사용 시 SKIP 반환으로 무한루프 방지
3. **GFM 플러그인 필수**: 테이블, 취소선 등은 기본 마크다운에 없음
