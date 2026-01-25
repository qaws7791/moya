import { createSignal, type Component, Show } from "solid-js";

interface OutputPanelProps {
  value: string;
  isLoading: boolean;
}

export const OutputPanel: Component<OutputPanelProps> = (props) => {
  const [copied, setCopied] = createSignal(false);

  const handleCopy = async () => {
    if (!props.value) return;
    try {
      await navigator.clipboard.writeText(props.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    if (!props.value) return;
    const blob = new Blob([props.value], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div class="card bg-base-100 border-base-200 flex h-full flex-col border">
      <div class="card-body relative flex h-full flex-col gap-4 p-4">
        <Show when={props.isLoading}>
          <div class="bg-base-100/50 absolute inset-0 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </Show>

        <div class="flex items-center justify-between">
          <h3 class="card-title flex items-center gap-2 text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-5 w-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            결과
          </h3>
          <div class="flex gap-2">
            <button
              class="btn btn-sm btn-soft"
              onClick={handleDownload}
              disabled={!props.value}
            >
              다운로드
            </button>
            <button
              class={`btn btn-sm ${copied() ? "btn-success text-white" : "btn-primary"}`}
              onClick={handleCopy}
              disabled={!props.value}
            >
              {copied() ? "복사됨!" : "복사하기"}
            </button>
          </div>
        </div>

        <textarea
          class="textarea textarea-bordered bg-base-50 w-full flex-1 resize-none font-mono text-sm leading-relaxed focus:outline-none"
          placeholder="결과가 여기에 표시됩니다..."
          value={props.value}
          readOnly
        ></textarea>
        <div class="text-base-content/50 text-right text-sm">
          {props.value.length.toLocaleString()} 자
        </div>
      </div>
    </div>
  );
};
