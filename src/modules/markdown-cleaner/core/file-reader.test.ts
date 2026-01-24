/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import {
  readMarkdownFile,
  isMarkdownFile,
  validateMarkdownFile,
} from "./file-reader";

describe("file-reader", () => {
  describe("isMarkdownFile", () => {
    it("should return true for .md files", () => {
      const file = new File([""], "test.md", { type: "text/markdown" });
      expect(isMarkdownFile(file)).toBe(true);
    });

    it("should return true for .markdown files", () => {
      const file = new File([""], "test.markdown", { type: "text/markdown" });
      expect(isMarkdownFile(file)).toBe(true);
    });

    it("should return false for .txt files", () => {
      const file = new File([""], "test.txt", { type: "text/plain" });
      expect(isMarkdownFile(file)).toBe(false);
    });

    it("should return false for .js files", () => {
      const file = new File([""], "test.js", {
        type: "application/javascript",
      });
      expect(isMarkdownFile(file)).toBe(false);
    });

    it("should handle case insensitive extensions", () => {
      const file1 = new File([""], "test.MD", { type: "text/markdown" });
      const file2 = new File([""], "test.Markdown", { type: "text/markdown" });
      expect(isMarkdownFile(file1)).toBe(true);
      expect(isMarkdownFile(file2)).toBe(true);
    });
  });

  describe("validateMarkdownFile", () => {
    it("should return valid for .md files", () => {
      const file = new File(["# Hello"], "test.md", { type: "text/markdown" });
      const result = validateMarkdownFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return error for non-markdown files", () => {
      const file = new File(["Hello"], "test.txt", { type: "text/plain" });
      const result = validateMarkdownFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "마크다운 파일(.md, .markdown)만 업로드할 수 있습니다.",
      );
    });

    it("should return error for too large files (>10MB)", () => {
      // Create a mock file with size > 10MB
      const largeContent = "x".repeat(11 * 1024 * 1024);
      const file = new File([largeContent], "test.md", {
        type: "text/markdown",
      });
      const result = validateMarkdownFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("파일 크기는 10MB 이하여야 합니다.");
    });
  });

  describe("readMarkdownFile", () => {
    it("should read markdown file content successfully", async () => {
      const content = "# Hello World\n\nThis is a test.";
      const file = new File([content], "test.md", { type: "text/markdown" });

      const result = await readMarkdownFile(file);
      expect(result).toBe(content);
    });

    it("should handle Korean text correctly", async () => {
      const content = "# 안녕하세요\n\n테스트입니다.";
      const file = new File([content], "test.md", { type: "text/markdown" });

      const result = await readMarkdownFile(file);
      expect(result).toBe(content);
    });

    it("should throw error for non-markdown files", async () => {
      const file = new File(["Hello"], "test.txt", { type: "text/plain" });

      await expect(readMarkdownFile(file)).rejects.toThrow(
        "마크다운 파일(.md, .markdown)만 업로드할 수 있습니다.",
      );
    });

    it("should handle empty files", async () => {
      const file = new File([""], "empty.md", { type: "text/markdown" });

      const result = await readMarkdownFile(file);
      expect(result).toBe("");
    });
  });
});
