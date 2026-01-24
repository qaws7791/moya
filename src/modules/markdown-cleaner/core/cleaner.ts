import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { visit, SKIP } from "unist-util-visit";
import type { CleanerOptions } from "./types";
import type { Parent, Literal } from "unist";

export async function cleanMarkdown(
  markdown: string,
  options: CleanerOptions = {},
): Promise<string> {
  if (!markdown) return "";

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => (tree) => {
      visit(tree, (node, index, parent) => {
        if (!parent || index === null || index === undefined) return;

        const p = parent as Parent;

        // 1. Delete Nodes (Remove completely)
        const shouldDelete =
          (node.type === "image" && options.removeImage) ||
          (node.type === "code" && options.removeCode) ||
          (node.type === "list" && options.removeList) ||
          (node.type === "table" && options.removeTable) ||
          (node.type === "thematicBreak" && options.removeThematicBreak) ||
          (node.type === "html" && options.removeHtml) ||
          (node.type === "break" && options.removeBreak) ||
          (node.type === "footnoteDefinition" && options.removeFootnote) ||
          (node.type === "footnoteReference" && options.removeFootnote);

        if (shouldDelete) {
          p.children.splice(index, 1);
          return [SKIP, index];
        }

        // 2. Unwrap Parent Nodes (Preserve children)
        const blockUnwrapTypes = ["heading", "blockquote"];
        const inlineUnwrapTypes = ["emphasis", "strong", "link", "delete"];

        const shouldUnwrap =
          (options.removeHeading && node.type === "heading") ||
          (options.removeBlockquote && node.type === "blockquote") ||
          (options.removeEmphasis && node.type === "emphasis") ||
          (options.removeStrong && node.type === "strong") ||
          (options.removeLink && node.type === "link") ||
          (options.removeDelete && node.type === "delete");

        if (shouldUnwrap) {
          const parentNode = node as Parent;
          if (Array.isArray(parentNode.children)) {
            // If it's a block type, wrap children in a paragraph if they are inline to preserve spacing
            if (blockUnwrapTypes.includes(node.type)) {
              // Check if children are inline (text, styling, etc.)
              // Simplified: Just wrap in paragraph node.
              // Note: 'paragraph' requires 'children'.
              // We need to construct a paragraph node.
              const paragraphNode = {
                type: "paragraph",
                children: parentNode.children,
              };
              p.children.splice(index, 1, paragraphNode as any);
            } else {
              // Inline unwrap: just lift children
              p.children.splice(index, 1, ...parentNode.children);
            }
            return [SKIP, index];
          }
        }

        // 3. Unwrap Literal Nodes (Convert to Text)
        if (node.type === "inlineCode" && options.removeInlineCode) {
          const literalNode = node as Literal;
          // Replace with text node containing the value
          p.children.splice(index, 1, {
            type: "text",
            value: literalNode.value as string,
          } as any);
          return [SKIP, index];
        }
      });
    })
    .use(remarkStringify);

  const result = await processor.process(markdown);
  return String(result).trim();
}
