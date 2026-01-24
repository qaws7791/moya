import { describe, it, expect } from "vitest";
import { cleanMarkdown } from "./cleaner";

describe("cleanMarkdown", () => {
  it("should return empty string when input is empty", async () => {
    const result = await cleanMarkdown("");
    expect(result).toBe("");
  });

  it("should return original markdown when no options are provided", async () => {
    const input = "# Hello World\n\nThis is a **bold** text.";
    const result = await cleanMarkdown(input, {});
    // Note: remark-stringify might slightly normalize formatting (e.g., proper spacing)
    // So we should expect semantic equality or normalized output.
    // For this simple case, we expect it to be largely the same, maybe with added newline.
    expect(result.trim()).toBe(input.trim());
  });

  it("should remove emphasis when removeEmphasis is true", async () => {
    const input = "This is *italic* text.";
    const expected = "This is italic text.";
    const result = await cleanMarkdown(input, { removeEmphasis: true });
    expect(result.trim()).toBe(expected);
  });

  it("should remove strong when removeStrong is true", async () => {
    const input = "This is **bold** text.";
    const expected = "This is bold text.";
    const result = await cleanMarkdown(input, { removeStrong: true });
    expect(result.trim()).toBe(expected);
  });

  it("should remove link but keep text when removeLink is true", async () => {
    const input = "Click [here](https://example.com) to go.";
    const expected = "Click here to go.";
    const result = await cleanMarkdown(input, { removeLink: true });
    expect(result.trim()).toBe(expected);
  });

  it("should remove image when removeImage is true", async () => {
    const input = "Look at this ![alt text](image.png).";
    const expected = "Look at this .";
    const result = await cleanMarkdown(input, { removeImage: true });
    expect(result.trim()).toBe(expected);
  });

  it("should unwrap inline code when removeInlineCode is true", async () => {
    const input = "Use `const` for constants.";
    const expected = "Use const for constants.";
    const result = await cleanMarkdown(input, { removeInlineCode: true });
    expect(result.trim()).toBe(expected);
  });

  it("should remove code block when removeCode is true", async () => {
    const input = "Check this code:\n```js\nconsole.log(1);\n```\nDone.";
    const expected = "Check this code:\n\nDone.";
    const result = await cleanMarkdown(input, { removeCode: true });
    expect(result.replace(/\s+/g, " ").trim()).toBe(
      expected.replace(/\s+/g, " ").trim(),
    );
  });

  it("should unwrap heading when removeHeading is true", async () => {
    const input = "# Title\nContent";
    const expected = "Title\n\nContent";
    const result = await cleanMarkdown(input, { removeHeading: true });
    expect(result.trim()).toBe(expected);
  });

  it("should unwrap blockquote when removeBlockquote is true", async () => {
    const input = "> Quote me\n\nText";
    // Blockquote content is usually block-level elements (paragraphs).
    // If we unwrap, we get those paragraphs directly.
    // > p("Quote me") -> p("Quote me")
    const expected = "Quote me\n\nText";
    const result = await cleanMarkdown(input, { removeBlockquote: true });
    expect(result.trim()).toBe(expected);
  });

  it("should remove list when removeList is true", async () => {
    const input = "List:\n- Item 1\n- Item 2\n\nEnd"; // Double newline to separate list from End
    const expected = "List:\n\nEnd";
    const result = await cleanMarkdown(input, { removeList: true });
    expect(result.replace(/\s+/g, " ").trim()).toBe(
      expected.replace(/\s+/g, " ").trim(),
    );
  });

  it("should remove thematicBreak when removeThematicBreak is true", async () => {
    const input = "Before\n\n---\n\nAfter";
    const expected = "Before\n\nAfter";
    const result = await cleanMarkdown(input, { removeThematicBreak: true });
    // Normalize newlines for comparison
    expect(result.trim().replace(/\n+/g, "\n")).toBe(
      expected.replace(/\n+/g, "\n"),
    );
  });

  it("should remove table when removeTable is true", async () => {
    const input = "| A | B |\n|---|---|\n| 1 | 2 |";
    const result = await cleanMarkdown(input, { removeTable: true });
    expect(result.trim()).toBe("");
  });

  it("should unwrap strikethrough (delete) when removeDelete is true", async () => {
    const input = "This is ~~wrong~~.";
    const expected = "This is wrong.";
    const result = await cleanMarkdown(input, { removeDelete: true });
    expect(result.trim()).toBe(expected);
  });

  it("should remove html when removeHtml is true", async () => {
    // If remark parses this as HTML node, removing it removes content.
    const input = "Text <div>Content</div> End";
    // Remark parses <div> and </div> as HTML nodes, Content as Text.
    // Removing HTML nodes leaves Text.
    const expected = "Text Content End";
    const result = await cleanMarkdown(input, { removeHtml: true });
    expect(result.replace(/\s+/g, " ").trim()).toBe(
      expected.replace(/\s+/g, " ").trim(),
    );

    const input2 = "Text <br> End";
    const expected2 = "Text  End";
    const result2 = await cleanMarkdown(input2, { removeHtml: true });
    expect(result2.replace(/\s+/g, " ").trim()).toBe(
      expected2.replace(/\s+/g, " ").trim(),
    );
  });

  it("should remove break when removeBreak is true", async () => {
    const input = "Line 1  \nLine 2"; // Two spaces at end = break
    const expected = "Line 1Line 2"; // Nodes merge
    const result = await cleanMarkdown(input, { removeBreak: true });
    expect(result.replace(/\s+/g, "").trim()).toBe(
      expected.replace(/\s+/g, "").trim(),
    );
  });

  it("should remove footnote when removeFootnote is true", async () => {
    const input = "Text[^1]\n\n[^1]: Note";
    // Remark GFM handles footnotes. Removal should remove reference and definition.
    const expected = "Text";
    const result = await cleanMarkdown(input, { removeFootnote: true });
    expect(result.replace(/\s+/g, "").trim()).toBe(
      expected.replace(/\s+/g, "").trim(),
    );
  });
});

describe("cleanMarkdown - Complex Cases", () => {
  it("should remove multiple formats simultaneously", async () => {
    const input =
      "# Title\n\nSome **bold** and *italic* text with [link](url).";
    // Remove heading, strong, emphasis, link
    const expected = "Title\n\nSome bold and italic text with link.";
    const result = await cleanMarkdown(input, {
      removeHeading: true,
      removeStrong: true,
      removeEmphasis: true,
      removeLink: true,
    });
    expect(result.trim()).toBe(expected);
  });

  it("should handle nested formatting (Bold inside Link)", async () => {
    const input = "Click [**Here**](url)";

    // Case 1: Remove Link only -> "Click **Here**"
    const res1 = await cleanMarkdown(input, { removeLink: true });
    expect(res1.trim()).toBe("Click **Here**");

    // Case 2: Remove Strong only -> "Click [Here](url)"
    const res2 = await cleanMarkdown(input, { removeStrong: true });
    expect(res2.trim()).toBe("Click [Here](url)");

    // Case 3: Remove Both -> "Click Here"
    const res3 = await cleanMarkdown(input, {
      removeLink: true,
      removeStrong: true,
    });
    expect(res3.trim()).toBe("Click Here");
  });

  it("should handle nested formatting (List with Bold and Code)", async () => {
    const input = "- **Bold Item**\n- `Code Item`";

    // Remove List but keep content
    // Since we delete 'list' node, the children (listItems) are removed because list removal logic uses splice(index, 1).
    // So content is gone.
    const res = await cleanMarkdown(input, { removeList: true });
    expect(res.trim()).toBe("");
  });

  it("should handle nested formatting (Emphasis inside Blockquote)", async () => {
    const input = "> This is *quoted* text.";
    // Remove Blockquote option unwraps it.
    const expected = "This is *quoted* text.";
    const result = await cleanMarkdown(input, { removeBlockquote: true });
    expect(result.trim()).toBe(expected);
  });

  it("should handle GFM Table with inner formatting", async () => {
    const input =
      "| **Head** | [Link](url) |\n|---|---|\n| `Code` | *Italic* |";
    // Remove Table -> Gone
    const result = await cleanMarkdown(input, { removeTable: true });
    expect(result.trim()).toBe("");
  });
});
