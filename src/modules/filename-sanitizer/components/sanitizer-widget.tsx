import { createSignal, createMemo, Show, For, type Component } from "solid-js";
import { sanitizeFilename } from "../core/sanitizer";
import type {
  OsOptions,
  AdvancedOptions,
  SanitizeOptions,
  SanitizeResult,
} from "../core/types";
import { DEFAULT_OS_OPTIONS, DEFAULT_ADVANCED_OPTIONS } from "../core/types";

// OS별 금지 문자 정보
const OS_INFO = [
  {
    os: "windows" as keyof OsOptions,
    label: "Windows",
    icon: "🪟",
    color: "badge-info",
    forbidden: ["\\ ", "/", ":", "*", "?", '"', "<", ">", "|"],
    note: "+ 제어 문자(0x00~0x1F), 예약된 이름(CON, NUL 등)",
  },
  {
    os: "linux" as keyof OsOptions,
    label: "Linux",
    icon: "🐧",
    color: "badge-success",
    forbidden: ["/"],
    note: "+ NUL(0x00)",
  },
  {
    os: "mac" as keyof OsOptions,
    label: "macOS",
    icon: "🍎",
    color: "badge-warning",
    forbidden: ["/", ":"],
    note: "+ NUL(0x00)",
  },
];

export const SanitizerWidget: Component = () => {
  const [input, setInput] = createSignal("");
  const [osOptions, setOsOptions] = createSignal<OsOptions>({
    ...DEFAULT_OS_OPTIONS,
  });
  const [advanced, setAdvanced] = createSignal<AdvancedOptions>({
    ...DEFAULT_ADVANCED_OPTIONS,
  });
  const [showAdvanced, setShowAdvanced] = createSignal(false);
  const [copied, setCopied] = createSignal(false);

  const options = createMemo<SanitizeOptions>(() => ({
    os: osOptions(),
    advanced: advanced(),
  }));

  const result = createMemo<SanitizeResult>(() =>
    sanitizeFilename(input(), options()),
  );

  const toggleOs = (os: keyof OsOptions) => {
    setOsOptions((prev) => ({ ...prev, [os]: !prev[os] }));
  };

  const setAdvancedField = <K extends keyof AdvancedOptions>(
    key: K,
    value: AdvancedOptions[K],
  ) => {
    setAdvanced((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    const text = result().sanitized;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeOsCount = createMemo(
    () => Object.values(osOptions()).filter(Boolean).length,
  );

  return (
    <div class="container mx-auto max-w-5xl p-4">
      {/* Header */}
      <div class="mb-10 text-center">
        <h1 class="from-primary to-secondary mb-2 bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent">
          Filename Sanitizer
        </h1>
        <p class="text-base-content/60 text-lg">
          텍스트에서 운영체제가 허용하지 않는 문자를 필터링하여 안전한 파일
          이름을 만드세요.
        </p>
      </div>

      {/* OS Selector */}
      <div class="card bg-base-100 border-base-200 mb-5 border">
        <div class="card-body p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="card-title text-lg font-bold">대상 운영체제</h2>
            <span class="text-base-content/50 text-sm">
              {activeOsCount() === 3
                ? "모든 OS에서 안전한 문자만 허용"
                : `${activeOsCount()}개 OS 기준으로 필터링`}
            </span>
          </div>

          <div class="flex flex-wrap gap-3">
            <For each={OS_INFO}>
              {(info) => (
                <label
                  class={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-5 py-3 transition-all ${
                    osOptions()[info.os]
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-base-200 text-base-content/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    class="hidden"
                    checked={osOptions()[info.os]}
                    onChange={() => toggleOs(info.os)}
                  />
                  <span class="text-xl">{info.icon}</span>
                  <span class="font-semibold">{info.label}</span>
                </label>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* OS 금지 문자 안내 */}
      <div class="card bg-base-100 border-base-200 mb-5 border">
        <div class="card-body p-5">
          <h2 class="card-title mb-3 text-lg font-bold">OS별 금지 문자 안내</h2>
          <div class="overflow-x-auto">
            <table class="table-sm table w-full">
              <thead>
                <tr class="text-base-content/60">
                  <th class="w-28">운영체제</th>
                  <th>금지 문자</th>
                  <th class="hidden sm:table-cell">추가 제한</th>
                </tr>
              </thead>
              <tbody>
                <For each={OS_INFO}>
                  {(info) => (
                    <tr class={osOptions()[info.os] ? "" : "opacity-35"}>
                      <td>
                        <div class="flex items-center gap-1.5 font-medium">
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                        </div>
                      </td>
                      <td>
                        <div class="flex flex-wrap gap-1">
                          <For each={info.forbidden}>
                            {(char) => (
                              <code class="badge badge-soft badge-sm font-mono">
                                {char}
                              </code>
                            )}
                          </For>
                        </div>
                      </td>
                      <td class="text-base-content/55 hidden text-sm sm:table-cell">
                        {info.note}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Input / Output */}
      <div class="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input */}
        <div class="card bg-base-100 border-base-200 border">
          <div class="card-body p-5">
            <h2 class="card-title mb-2 text-lg font-bold">입력</h2>
            <textarea
              class="textarea bg-base-200 h-36 w-full resize-none font-mono text-sm leading-relaxed"
              placeholder="파일 이름으로 사용할 텍스트를 입력하세요..."
              value={input()}
              onInput={(e) => setInput(e.currentTarget.value)}
            />
            <div class="text-base-content/40 mt-1 text-right text-sm">
              {input().length}자
            </div>
          </div>
        </div>

        {/* Output */}
        <div class="card bg-base-100 border-base-200 border">
          <div class="card-body p-5">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="card-title text-lg font-bold">결과</h2>
              <button
                class={`btn btn-sm ${copied() ? "btn-success" : "btn-primary"}`}
                disabled={!result().sanitized}
                onClick={handleCopy}
              >
                {copied() ? "✓ 복사됨" : "복사"}
              </button>
            </div>

            <div
              class={`bg-base-200 flex h-36 items-start overflow-auto rounded-xl p-3 font-mono text-sm leading-relaxed break-all ${
                !result().sanitized ? "text-base-content/30 italic" : ""
              }`}
            >
              {result().sanitized || "결과가 여기에 표시됩니다"}
            </div>

            {/* 제거된 문자 */}
            <Show when={result().removedChars.length > 0}>
              <div class="mt-3">
                <span class="text-base-content/55 text-sm font-medium">
                  제거된 문자:
                </span>
                <div class="mt-1 flex flex-wrap gap-1">
                  <For each={result().removedChars}>
                    {(char) => (
                      <code class="badge badge-soft badge-error badge-sm font-mono">
                        {char === "\t"
                          ? "\\t"
                          : char.charCodeAt(0) < 0x20
                            ? `\\x${char.charCodeAt(0).toString(16).padStart(2, "0")}`
                            : char}
                      </code>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* 경고 */}
            <Show when={result().warnings.length > 0}>
              <div class="alert alert-warning mt-3 py-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <For each={result().warnings}>{(w) => <span>{w}</span>}</For>
              </div>
            </Show>
          </div>
        </div>
      </div>

      {/* 고급 옵션 - 점진적 공개 */}
      <div class="card bg-base-100 border-base-200 border">
        <button
          class="flex w-full cursor-pointer items-center justify-between p-5"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <span class="font-semibold">고급 옵션</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class={`h-5 w-5 transition-transform ${showAdvanced() ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <Show when={showAdvanced()}>
          <div class="border-base-200 grid grid-cols-1 gap-x-8 gap-y-5 border-t p-5 sm:grid-cols-2">
            {/* 공백 처리 */}
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium">공백 처리</label>
              <select
                class="select select-sm bg-base-200 w-full"
                value={String(advanced().replaceSpacesWith ?? "null")}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  setAdvancedField(
                    "replaceSpacesWith",
                    val === "null" ? null : (val as "_" | "-" | ""),
                  );
                }}
              >
                <option value="null">유지 (기본값)</option>
                <option value="_">언더스코어(_)로 대체</option>
                <option value="-">하이픈(-)으로 대체</option>
                <option value="">제거</option>
              </select>
            </div>

            {/* 최대 길이 */}
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium">
                최대 길이
                <span class="text-base-content/40 ml-1 font-normal">
                  (비워두면 제한 없음)
                </span>
              </label>
              <input
                type="number"
                class="input input-sm bg-base-200 w-full"
                placeholder="예: 255"
                min="1"
                max="4096"
                value={advanced().maxLength ?? ""}
                onInput={(e) => {
                  const val = e.currentTarget.value;
                  setAdvancedField(
                    "maxLength",
                    val === "" ? null : Math.max(1, parseInt(val, 10)),
                  );
                }}
              />
            </div>

            {/* 소문자 변환 */}
            <label class="label hover:bg-base-200/50 cursor-pointer justify-start gap-3 rounded-lg p-2 transition-colors">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                checked={advanced().lowercase}
                onChange={() =>
                  setAdvancedField("lowercase", !advanced().lowercase)
                }
              />
              <div>
                <span class="label-text font-medium">소문자로 변환</span>
                <p class="text-base-content/50 text-sm">
                  모든 대문자를 소문자로 변환합니다
                </p>
              </div>
            </label>

            {/* 앞뒤 점/공백 제거 */}
            <label class="label hover:bg-base-200/50 cursor-pointer justify-start gap-3 rounded-lg p-2 transition-colors">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                checked={advanced().trimDotsAndSpaces}
                onChange={() =>
                  setAdvancedField(
                    "trimDotsAndSpaces",
                    !advanced().trimDotsAndSpaces,
                  )
                }
              />
              <div>
                <span class="label-text font-medium">앞뒤 점·공백 제거</span>
                <p class="text-base-content/50 text-sm">
                  Windows는 끝에 점(.)이나 공백을 허용하지 않습니다
                </p>
              </div>
            </label>
          </div>
        </Show>
      </div>
    </div>
  );
};
