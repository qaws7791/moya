import { type Component, createSignal } from "solid-js";
import { readMarkdownFile, isMarkdownFile } from "../core/file-reader";

interface InputPanelProps {
  value: string;
  onValueChange: (val: string) => void;
  isLoading: boolean;
}

export const InputPanel: Component<InputPanelProps> = (props) => {
  const [isDragOver, setIsDragOver] = createSignal(false);
  const [fileError, setFileError] = createSignal<string | null>(null);
  let fileInputRef: HTMLInputElement | undefined;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      props.onValueChange(text);
      setFileError(null);
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setFileError(null);
      const content = await readMarkdownFile(file);
      props.onValueChange(content);
    } catch (err) {
      setFileError(
        err instanceof Error
          ? err.message
          : "파일을 읽는 중 오류가 발생했습니다.",
      );
    }
  };

  const handleFileInputChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      await handleFileSelect(file);
      // Reset input for re-selecting same file
      input.value = "";
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isMarkdownFile(file)) {
        await handleFileSelect(file);
      } else {
        setFileError("마크다운 파일(.md, .markdown)만 업로드할 수 있습니다.");
      }
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
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              class="hidden"
              onChange={handleFileInputChange}
            />
            <button
              class="btn btn-xs btn-outline btn-secondary"
              onClick={() => fileInputRef?.click()}
              title="마크다운 파일 업로드"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              파일 업로드
            </button>
            <button
              class="btn btn-xs btn-ghost"
              onClick={() => {
                props.onValueChange("");
                setFileError(null);
              }}
            >
              지우기
            </button>
            <button class="btn btn-xs btn-primary" onClick={handlePaste}>
              붙여넣기
            </button>
          </div>
        </div>

        {/* Error message */}
        {fileError() && (
          <div class="alert alert-error py-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{fileError()}</span>
          </div>
        )}

        {/* Textarea with drag & drop support */}
        <div
          class={`relative flex-1 ${isDragOver() ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragOver() && (
            <div class="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10 pointer-events-none">
              <div class="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-12 h-12 mx-auto text-primary mb-2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <p class="text-primary font-medium">
                  .md 파일을 여기에 놓으세요
                </p>
              </div>
            </div>
          )}

          <textarea
            class="textarea textarea-bordered w-full h-full font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-primary/50"
            placeholder="여기에 마크다운을 붙여넣거나, .md 파일을 드래그앤드롭 하세요..."
            value={props.value}
            onInput={(e) => {
              props.onValueChange(e.currentTarget.value);
              setFileError(null);
            }}
          ></textarea>
        </div>

        <div class="text-xs text-base-content/50 text-right">
          {props.value.length.toLocaleString()} 자
        </div>
      </div>
    </div>
  );
};
