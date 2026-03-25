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
          (node.type === "footnoteReference" && options.removeFootnote) ||
          (node.type === "link" && options.removeLink);

        if (shouldDelete) {
          // Clean up adjacent whitespace for inline nodes (link, image)
          // to avoid orphaned spaces after removal
          const isInlineDelete =
            node.type === "link" || node.type === "image";

          if (isInlineDelete) {
            const prevSibling = index > 0 ? p.children[index - 1] : null;
            const nextSibling =
              index + 1 < p.children.length ? p.children[index + 1] : null;
            const hasPrevText =
              prevSibling &&
              (prevSibling as any).type === "text" &&
              typeof (prevSibling as Literal).value === "string";
            const hasNextText =
              nextSibling &&
              (nextSibling as any).type === "text" &&
              typeof (nextSibling as Literal).value === "string";

            if (hasPrevText && hasNextText) {
              // Both sides have text: trim trailing from prev only
              (prevSibling as Literal).value = (
                (prevSibling as Literal).value as string
              ).trimEnd();
            } else if (hasPrevText) {
              (prevSibling as Literal).value = (
                (prevSibling as Literal).value as string
              ).trimEnd();
            } else if (hasNextText) {
              (nextSibling as Literal).value = (
                (nextSibling as Literal).value as string
              ).trimStart();
            }
          }

          p.children.splice(index, 1);
          return [SKIP, index];
        }

        // 2. Unwrap Parent Nodes (Preserve children)
        const blockUnwrapTypes = ["heading", "blockquote"];

        const shouldUnwrap =
          (options.removeHeading && node.type === "heading") ||
          (options.removeBlockquote && node.type === "blockquote") ||
          (options.removeEmphasis && node.type === "emphasis") ||
          (options.removeStrong && node.type === "strong") ||
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
