import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import type { Root, Text } from "mdast";

export class KoreanMarkdownFixer {
  private processor;

  constructor() {
    this.processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkStringify); // Stringify is strictly not needed for parsing, but kept for completeness
  }

  public fix(markdown: string): string {
    const tree = this.processor.parse(markdown) as Root;
    const patches: { start: number; end: number; replacement: string }[] = [];

    visit(tree, (node) => {
      if (!node.position) return;

      // Phase 1: Text nodes (for unparsed/broken delimiters)
      if (node.type === "text") {
        const text = (node as Text).value;
        const regex = /(\*\*|__|~~|\*|_)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
          const delimiter = match[0];
          const index = match.index;
          const matchEnd = index + delimiter.length;

          if (matchEnd >= text.length) continue;
          const nextChar = text[matchEnd];

          // If next char is whitespace or punctuation, no fix needed
          if (/[\p{P}\s]/u.test(nextChar)) continue;

          if (index === 0) continue;
          const prevChar = text[index - 1];

          let needsFix = false;

          // Rule A: Preceded by Punctuation
          if (/[\p{P}]/u.test(prevChar)) {
            needsFix = true;
          }
          // Rule B: Preceded by Alphanumeric (Only for _ and __)
          else if (delimiter.includes("_")) {
            if (/[\p{L}\p{N}]/u.test(prevChar)) {
              needsFix = true;
            }
          }

          if (needsFix) {
            const absolutePos = node.position!.start.offset! + matchEnd;
            patches.push({
              start: absolutePos,
              end: absolutePos,
              replacement: " ",
            });
          }
        }
      }

      // Phase 2: Strong/Emphasis/Delete nodes (for parsed but potentially problematic delimiters)
      else if (
        node.type === "strong" ||
        node.type === "emphasis" ||
        node.type === "delete"
      ) {
        const endOffset = node.position.end.offset!;
        if (endOffset >= markdown.length) return;

        const nextChar = markdown[endOffset];
        // Only fix if followed by Non-Space AND Non-Punctuation
        if (/[\p{P}\s]/u.test(nextChar)) return;

        // Determine delimiter
        const startOffset = node.position.start.offset!;
        // Look at source to find delimiter used
        let delimiter = "";
        if (node.type === "delete") {
          delimiter = "~~";
        } else {
          // check start of node in markdown
          const twoChars = markdown.slice(startOffset, startOffset + 2);
          if (node.type === "strong") {
            delimiter = twoChars; // ** or __
          } else {
            // emphasis
            delimiter = twoChars[0]; // * or _
          }
        }

        // Get preceding character (char before the closing delimiter)
        // Closing delimiter ends at endOffset.
        // It starts at endOffset - delimiter.length.
        // Preceding char is at endOffset - delimiter.length - 1.
        const prevCharIndex = endOffset - delimiter.length - 1;
        if (prevCharIndex < 0) return;
        const prevChar = markdown[prevCharIndex];

        let needsFix = false;

        // Rule A: Preceded by Punctuation
        // Note: If delimiter is **, *, ~~, _, __ - ALL are subject to Rule A (Punc + Delim + Text)
        if (/[\p{P}]/u.test(prevChar)) {
          needsFix = true;
        }
        // Rule B: Preceded by Alphanumeric (Only for _ and __)
        else if (delimiter.includes("_")) {
          if (/[\p{L}\p{N}]/u.test(prevChar)) {
            needsFix = true;
          }
        }

        if (needsFix) {
          patches.push({
            start: endOffset,
            end: endOffset,
            replacement: " ",
          });
        }
      }
    });

    // Sort patches by start index descending to apply without offset shift
    patches.sort((a, b) => b.start - a.start);

    // Remove duplicates (if any, though shouldn't be with this logic)
    // Apply patches
    let result = markdown;
    for (const patch of patches) {
      result =
        result.slice(0, patch.start) +
        patch.replacement +
        result.slice(patch.end);
    }

    return result;
  }
}
