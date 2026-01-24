import { type Component, createSignal } from "solid-js";

interface InputPanelProps {
  value: string;
  onValueChange: (val: string) => void;
  isLoading: boolean;
}

export const InputPanel: Component<InputPanelProps> = (props) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      props.onValueChange(text);
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  return (
    <div class="card bg-base-100 shadow-xl border border-base-200 h-full flex flex-col">
      <div class="card-body p-4 flex flex-col h-full gap-4">
        <div class="flex justify-between items-center">
          <h3 class="card-title text-lg flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            입력
          </h3>
          <div class="flex gap-2">
            <button
              class="btn btn-xs btn-ghost"
              onClick={() => props.onValueChange("")}
            >
              지우기
            </button>
            <button class="btn btn-xs btn-primary" onClick={handlePaste}>
              붙여넣기
            </button>
          </div>
        </div>

        <textarea
          class="textarea textarea-bordered w-full flex-1 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-primary/50"
          placeholder="여기에 마크다운을 붙여넣으세요..."
          value={props.value}
          onInput={(e) => props.onValueChange(e.currentTarget.value)}
        ></textarea>

        <div class="text-xs text-base-content/50 text-right">
          {props.value.length.toLocaleString()} 자
        </div>
      </div>
    </div>
  );
};
