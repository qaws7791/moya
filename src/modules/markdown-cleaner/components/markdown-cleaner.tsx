import { createSignal, createEffect, type Component } from "solid-js";
import { FormatSelector } from "./format-selector";
import { InputPanel } from "./input-panel";
import { OutputPanel } from "./output-panel";
import { cleanMarkdown } from "../core/cleaner";
import type { CleanerOptions } from "../core/types";

export const MarkdownCleaner: Component = () => {
  const [input, setInput] = createSignal("");
  const [output, setOutput] = createSignal("");
  const [options, setOptions] = createSignal<CleanerOptions>({});
  const [loading, setLoading] = createSignal(false);

  // Debounce logic for processing
  let debounceTimer: ReturnType<typeof setTimeout>;

  const processMarkdown = async (text: string, opts: CleanerOptions) => {
    setLoading(true);
    try {
      // Small delay to allow UI to update loading state
      const result = await cleanMarkdown(text, opts);
      setOutput(result);
    } catch (err) {
      console.error("Processing error:", err);
      setOutput("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    const currentInput = input();
    const currentOptions = options();

    // Clear previous timer
    if (debounceTimer) clearTimeout(debounceTimer);

    // Debounce processing
    debounceTimer = setTimeout(() => {
      if (!currentInput) {
        setOutput("");
        return;
      }
      processMarkdown(currentInput, currentOptions);
    }, 300);
  });

  return (
    <div class="container mx-auto p-4 max-w-7xl">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Markdown Cleaner
        </h1>
        <p class="text-base-content/60 text-lg">
          AI가 생성한 마크다운에서 불필요한 서식을 깔끔하게 제거하세요.
        </p>
      </div>

      <FormatSelector options={options()} onOptionsChange={setOptions} />

      {/* Main Content Area - Responsive Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <InputPanel
          value={input()}
          onValueChange={setInput}
          isLoading={loading()}
        />
        <OutputPanel value={output()} isLoading={loading()} />
      </div>
    </div>
  );
};
