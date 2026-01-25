import { createSignal, createEffect, type Component } from "solid-js";
import { InputPanel } from "../../markdown-cleaner/components/input-panel";
import { OutputPanel } from "../../markdown-cleaner/components/output-panel";
import { KoreanMarkdownFixer } from "../core/fixer";

export const FixerUI: Component = () => {
  const [input, setInput] = createSignal("");
  const [output, setOutput] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const fixer = new KoreanMarkdownFixer();

  // Debounce logic for processing
  let debounceTimer: ReturnType<typeof setTimeout>;

  const processMarkdown = (text: string) => {
    setLoading(true);
    try {
      // Simulate slight delay for better UX if needed, or just run sync
      // Since it's sync and potentially fast, we might not need much delay,
      // but setting loading=true/false immediately might flicker.
      // Let's wrap in setTimeout to allow UI render cycle to show loading if it was heavy,
      // though regex is fast.

      const result = fixer.fix(text);
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

    // Clear previous timer
    if (debounceTimer) clearTimeout(debounceTimer);

    // Debounce processing
    debounceTimer = setTimeout(() => {
      if (!currentInput) {
        setOutput("");
        return;
      }
      processMarkdown(currentInput);
    }, 300);
  });

  return (
    <div class="container mx-auto max-w-7xl p-4">
      <div class="mb-10 text-center">
        <h1 class="from-primary to-secondary mb-2 bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent">
          Korean Markdown Fixer
        </h1>
        <p class="text-base-content/60 text-lg">
          글자에 `**`나 `_` 같은 기호가 사라지지 않고 그대로 노출되는 문제를
          해결해 드려요.
        </p>
      </div>

      {/* Main Content Area - Responsive Grid */}
      <div class="grid h-[600px] grid-cols-1 gap-6 lg:grid-cols-2">
        <InputPanel
          value={input()}
          onValueChange={setInput}
          isLoading={loading()}
        />
        <OutputPanel
          value={output()}
          isLoading={loading()}
        />
      </div>
    </div>
  );
};
