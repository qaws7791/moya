import { describe, it, expect } from "vitest";
import { sanitizeFilename } from "./sanitizer";
import type { SanitizeOptions } from "./types";

const allOs: SanitizeOptions["os"] = { windows: true, linux: true, mac: true };
const noAdvanced: SanitizeOptions["advanced"] = {
  replaceSpacesWith: null,
  maxLength: null,
  lowercase: false,
  trimDotsAndSpaces: false,
};

function opts(
  os: Partial<SanitizeOptions["os"]> = {},
  advanced: Partial<SanitizeOptions["advanced"]> = {},
): SanitizeOptions {
  return {
    os: { ...allOs, ...os },
    advanced: { ...noAdvanced, ...advanced },
  };
}

// [1] 유효한 텍스트는 그대로 반환
describe("sanitizeFilename - 기본 동작", () => {
  it("유효한 파일명은 그대로 반환한다", () => {
    const result = sanitizeFilename("hello-world.txt", opts());
    expect(result.sanitized).toBe("hello-world.txt");
    expect(result.removedChars).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("빈 문자열은 빈 문자열로 반환한다", () => {
    const result = sanitizeFilename("", opts());
    expect(result.sanitized).toBe("");
  });
});

// [2] Windows 금지 문자 필터링
describe("sanitizeFilename - Windows 금지 문자", () => {
  it("windows=true일 때 백슬래시를 제거한다", () => {
    const result = sanitizeFilename(
      "path\\file",
      opts({ linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("pathfile");
    expect(result.removedChars).toContain("\\");
  });

  it("windows=true일 때 콜론을 제거한다", () => {
    const result = sanitizeFilename(
      "C:file",
      opts({ linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("Cfile");
    expect(result.removedChars).toContain(":");
  });

  it("windows=true일 때 별표를 제거한다", () => {
    const result = sanitizeFilename(
      "file*name",
      opts({ linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("filename");
    expect(result.removedChars).toContain("*");
  });

  it("windows=true일 때 물음표를 제거한다", () => {
    const result = sanitizeFilename(
      "file?name",
      opts({ linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("filename");
    expect(result.removedChars).toContain("?");
  });

  it("windows=true일 때 큰따옴표를 제거한다", () => {
    const result = sanitizeFilename(
      'file"name',
      opts({ linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("filename");
    expect(result.removedChars).toContain('"');
  });

  it("windows=true일 때 꺾쇠 및 파이프를 제거한다", () => {
    const result = sanitizeFilename(
      "file<>|name",
      opts({ linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("filename");
    expect(result.removedChars).toContain("<");
    expect(result.removedChars).toContain(">");
    expect(result.removedChars).toContain("|");
  });

  it("windows=false일 때 별표를 제거하지 않는다", () => {
    const result = sanitizeFilename(
      "file*name",
      opts({ windows: false, linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("file*name");
  });
});

// [3] Linux 금지 문자 필터링
describe("sanitizeFilename - Linux 금지 문자", () => {
  it("linux=true일 때 슬래시를 제거한다", () => {
    const result = sanitizeFilename(
      "path/file",
      opts({ windows: false, mac: false }),
    );
    expect(result.sanitized).toBe("pathfile");
    expect(result.removedChars).toContain("/");
  });

  it("linux=false일 때 슬래시를 유지한다 (windows/mac도 false인 경우)", () => {
    const result = sanitizeFilename(
      "a/b",
      opts({ windows: false, linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("a/b");
  });
});

// [4] macOS 금지 문자 필터링
describe("sanitizeFilename - macOS 금지 문자", () => {
  it("mac=true일 때 콜론을 제거한다", () => {
    const result = sanitizeFilename(
      "file:name",
      opts({ windows: false, linux: false }),
    );
    expect(result.sanitized).toBe("filename");
    expect(result.removedChars).toContain(":");
  });

  it("mac=false이고 windows=false일 때 콜론을 유지한다", () => {
    const result = sanitizeFilename(
      "file:name",
      opts({ windows: false, linux: false, mac: false }),
    );
    expect(result.sanitized).toBe("file:name");
  });
});

// [5] 기본값(모든 OS) - 가장 엄격한 필터링
describe("sanitizeFilename - 기본 OS 설정 (전체)", () => {
  it("모든 OS 활성화 시 Windows+Linux+macOS 금지 문자를 모두 제거한다", () => {
    const result = sanitizeFilename('file\\/:*?"<>|name', opts());
    expect(result.sanitized).toBe("filename");
  });
});

// [6] 제어 문자 제거
describe("sanitizeFilename - 제어 문자", () => {
  it("제어 문자(0x00~0x1F)를 제거한다", () => {
    const result = sanitizeFilename("file\x00name", opts());
    expect(result.sanitized).toBe("filename");
    expect(result.removedChars).toContain("\x00");
  });

  it("탭 문자를 제거한다", () => {
    const result = sanitizeFilename("file\tname", opts());
    expect(result.sanitized).toBe("filename");
    expect(result.removedChars).toContain("\t");
  });
});

// [7] 공백 대체 옵션
describe("sanitizeFilename - 공백 대체", () => {
  it("replaceSpacesWith='_'일 때 공백을 언더스코어로 대체한다", () => {
    const result = sanitizeFilename(
      "hello world",
      opts({}, { replaceSpacesWith: "_" }),
    );
    expect(result.sanitized).toBe("hello_world");
  });

  it("replaceSpacesWith='-'일 때 공백을 하이픈으로 대체한다", () => {
    const result = sanitizeFilename(
      "hello world",
      opts({}, { replaceSpacesWith: "-" }),
    );
    expect(result.sanitized).toBe("hello-world");
  });

  it("replaceSpacesWith=''일 때 공백을 제거한다", () => {
    const result = sanitizeFilename(
      "hello world",
      opts({}, { replaceSpacesWith: "" }),
    );
    expect(result.sanitized).toBe("helloworld");
  });

  it("replaceSpacesWith=null이면 공백을 그대로 유지한다", () => {
    const result = sanitizeFilename(
      "hello world",
      opts({}, { replaceSpacesWith: null }),
    );
    expect(result.sanitized).toBe("hello world");
  });
});

// [8] 최대 길이 제한
describe("sanitizeFilename - 최대 길이", () => {
  it("maxLength 설정 시 그 길이로 잘라낸다", () => {
    const result = sanitizeFilename("abcdefghij", opts({}, { maxLength: 5 }));
    expect(result.sanitized).toBe("abcde");
  });

  it("maxLength=null이면 길이를 제한하지 않는다", () => {
    const longText = "a".repeat(300);
    const result = sanitizeFilename(longText, opts({}, { maxLength: null }));
    expect(result.sanitized).length(300);
  });
});

// [9] 소문자 변환
describe("sanitizeFilename - 소문자 변환", () => {
  it("lowercase=true일 때 대문자를 소문자로 변환한다", () => {
    const result = sanitizeFilename(
      "Hello World",
      opts({}, { lowercase: true }),
    );
    expect(result.sanitized).toBe("hello world");
  });

  it("lowercase=false일 때 대소문자를 유지한다", () => {
    const result = sanitizeFilename(
      "Hello World",
      opts({}, { lowercase: false }),
    );
    expect(result.sanitized).toBe("Hello World");
  });
});

// [10] 앞뒤 점/공백 제거
describe("sanitizeFilename - 앞뒤 점/공백 제거", () => {
  it("trimDotsAndSpaces=true일 때 앞뒤 점을 제거한다", () => {
    const result = sanitizeFilename(
      ".hidden",
      opts({}, { trimDotsAndSpaces: true }),
    );
    expect(result.sanitized).toBe("hidden");
  });

  it("trimDotsAndSpaces=true일 때 뒤쪽 점을 제거한다", () => {
    const result = sanitizeFilename(
      "file.",
      opts({}, { trimDotsAndSpaces: true }),
    );
    expect(result.sanitized).toBe("file");
  });

  it("trimDotsAndSpaces=true일 때 앞뒤 공백을 제거한다", () => {
    const result = sanitizeFilename(
      "  file  ",
      opts({}, { trimDotsAndSpaces: true }),
    );
    expect(result.sanitized).toBe("file");
  });

  it("trimDotsAndSpaces=false일 때 앞뒤 점/공백을 유지한다", () => {
    const result = sanitizeFilename(
      ".file.",
      opts({}, { trimDotsAndSpaces: false }),
    );
    expect(result.sanitized).toBe(".file.");
  });
});

// [11] 제거된 문자 목록 반환 (중복 제거)
describe("sanitizeFilename - removedChars 중복 제거", () => {
  it("동일한 금지 문자가 여러 번 나와도 removedChars에 한 번만 포함된다", () => {
    const result = sanitizeFilename("a:b:c:", opts());
    expect(result.removedChars.filter((c: string) => c === ":")).toHaveLength(
      1,
    );
  });
});

// [12] Windows 예약된 이름 경고
describe("sanitizeFilename - Windows 예약된 이름 경고", () => {
  it("windows=true일 때 CON은 경고를 반환한다", () => {
    const result = sanitizeFilename("CON", opts());
    expect(result.warnings.some((w: string) => w.includes("CON"))).toBe(true);
  });

  it("windows=true일 때 NUL은 경고를 반환한다", () => {
    const result = sanitizeFilename("NUL", opts());
    expect(result.warnings.some((w: string) => w.includes("NUL"))).toBe(true);
  });

  it("windows=true일 때 COM1은 경고를 반환한다", () => {
    const result = sanitizeFilename("COM1", opts());
    expect(result.warnings.some((w: string) => w.includes("COM1"))).toBe(true);
  });

  it("windows=true일 때 CON.txt도 경고를 반환한다", () => {
    const result = sanitizeFilename("CON.txt", opts());
    expect(result.warnings.some((w: string) => w.includes("CON"))).toBe(true);
  });

  it("windows=false일 때 CON은 경고를 반환하지 않는다", () => {
    const result = sanitizeFilename("CON", opts({ windows: false }));
    expect(result.warnings).toHaveLength(0);
  });

  it("일반 이름은 경고를 반환하지 않는다", () => {
    const result = sanitizeFilename("myfile", opts());
    expect(result.warnings).toHaveLength(0);
  });
});
