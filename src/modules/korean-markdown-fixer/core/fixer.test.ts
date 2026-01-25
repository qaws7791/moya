import { describe, it, expect } from "vitest";
import { KoreanMarkdownFixer } from "./fixer";

// Test cases from turth-table.csv
const testCases = [
  // Rule A: Closing delimiter + Punctuation + Emphasis Marker + Korean
  {
    id: "T-01",
    input: "**일반적인한글**입니다",
    expected: "**일반적인한글**입니다",
    desc: "일반 텍스트 + 조사: 정상 렌더링",
  },
  {
    id: "T-02",
    input: "**General Text** is good",
    expected: "**General Text** is good",
    desc: "영어 + 공백: 정상 렌더링",
  },
  {
    id: "T-03",
    input: "**괄호가포함된(Text)** 입니다",
    expected: "**괄호가포함된(Text)** 입니다",
    desc: "닫는 특수문자 뒤에 공백 존재",
  },
  {
    id: "T-04",
    input: "**끝이글자로끝남(Text)A**입니다",
    expected: "**끝이글자로끝남(Text)A**입니다",
    desc: "닫는 문자열이 알파벳: Intra-word 처리",
  },
  {
    id: "T-05",
    input: "**괄호로끝남(Text)**입니다",
    expected: "**괄호로끝남(Text)** 입니다",
    desc: "닫는 특수문자 + 한글 직접 연결",
  },
  {
    id: "T-06",
    input: "**대괄호로끝남[Text]**입니다",
    expected: "**대괄호로끝남[Text]** 입니다",
    desc: "대괄호 + 한글 직접 연결",
  },
  {
    id: "T-07",
    input: "**중괄호로끝남{Text}**입니다",
    expected: "**중괄호로끝남{Text}** 입니다",
    desc: "중괄호 + 한글 직접 연결",
  },
  {
    id: "T-08",
    input: '**따옴표로끝남"Text"**입니다',
    expected: '**따옴표로끝남"Text"** 입니다',
    desc: "따옴표 + 한글 직접 연결",
  },
  {
    id: "T-09",
    input: "**마침표로끝남.**입니다",
    expected: "**마침표로끝남.** 입니다",
    desc: "마침표 + 한글 직접 연결",
  },
  {
    id: "T-10",
    input: "**느낌표로끝남!**입니다",
    expected: "**느낌표로끝남!** 입니다",
    desc: "느낌표 + 한글 직접 연결",
  },
  {
    id: "T-11",
    input: "**물음표로끝남?**입니다",
    expected: "**물음표로끝남?** 입니다",
    desc: "물음표 + 한글 직접 연결",
  },
  {
    id: "T-12",
    input: "**특수문자뒤에숫자(Text)**123",
    expected: "**특수문자뒤에숫자(Text)** 123",
    desc: "닫는 특수문자 + 숫자 직접 연결",
  },
  {
    id: "T-13",
    input: "**특수문자뒤에이모지(Text)**✅",
    expected: "**특수문자뒤에이모지(Text)** ✅",
    desc: "닫는 특수문자 + 이모지 직접 연결",
  },
  {
    id: "T-14",
    input: "**특수문자뒤에공백(Text)** 입니다",
    expected: "**특수문자뒤에공백(Text)** 입니다",
    desc: "닫는 특수문자 뒤에 공백 존재",
  },
  {
    id: "T-15",
    input: "**특수문자뒤에문장부호(Text)**.",
    expected: "**특수문자뒤에문장부호(Text)**.",
    desc: "닫는 특수문자 뒤에 문장부호 존재",
  },
  {
    id: "T-16",
    input: "`**코드블럭(Text)**입니다`",
    expected: "`**코드블럭(Text)**입니다`",
    desc: "코드 블록 내부",
  },
  {
    id: "T-17",
    input: "<strong>HTML태그사용(Text)</strong>입니다",
    expected: "<strong>HTML태그사용(Text)</strong>입니다",
    desc: "이미 HTML strong 사용",
  },

  // Italic (*)
  {
    id: "T-18",
    input: "*일반적인한글*입니다",
    expected: "*일반적인한글*입니다",
    desc: "기울임(*) 일반 텍스트 + 조사",
  },
  {
    id: "T-19",
    input: "*General Text* is good",
    expected: "*General Text* is good",
    desc: "기울임(*) 영어 + 공백",
  },
  {
    id: "T-20",
    input: "*괄호가포함된(Text)* 입니다",
    expected: "*괄호가포함된(Text)* 입니다",
    desc: "기울임(*) 닫는 특수문자 뒤에 공백",
  },
  {
    id: "T-21",
    input: "*끝이글자로끝남(Text)A*입니다",
    expected: "*끝이글자로끝남(Text)A*입니다",
    desc: "기울임(*) 닫는 문자열이 알파벳",
  },
  {
    id: "T-22",
    input: "*괄호로끝남(Text)*입니다",
    expected: "*괄호로끝남(Text)* 입니다",
    desc: "기울임(*) 닫는 기호 + 한글",
  },
  {
    id: "T-23",
    input: "*대괄호로끝남[Text]*입니다",
    expected: "*대괄호로끝남[Text]* 입니다",
    desc: "기울임(*) 대괄호 + 한글",
  },
  {
    id: "T-24",
    input: "*중괄호로끝남{Text}*입니다",
    expected: "*중괄호로끝남{Text}* 입니다",
    desc: "기울임(*) 중괄호 + 한글",
  },
  {
    id: "T-25",
    input: '*따옴표로끝남"Text"*입니다',
    expected: '*따옴표로끝남"Text"* 입니다',
    desc: "기울임(*) 따옴표 + 한글",
  },
  {
    id: "T-26",
    input: "*마침표로끝남.*입니다",
    expected: "*마침표로끝남.* 입니다",
    desc: "기울임(*) 마침표 + 한글",
  },
  {
    id: "T-27",
    input: "*느낌표로끝남!*입니다",
    expected: "*느낌표로끝남!* 입니다",
    desc: "기울임(*) 느낌표 + 한글",
  },
  {
    id: "T-28",
    input: "*물음표로끝남?*입니다",
    expected: "*물음표로끝남?* 입니다",
    desc: "기울임(*) 물음표 + 한글",
  },
  {
    id: "T-29",
    input: "*특수문자뒤에숫자(Text)*123",
    expected: "*특수문자뒤에숫자(Text)* 123",
    desc: "기울임(*) 닫는 기호 뒤에 숫자",
  },
  {
    id: "T-30",
    input: "*특수문자뒤에이모지(Text)*✅",
    expected: "*특수문자뒤에이모지(Text)* ✅",
    desc: "기울임(*) 닫는 기호 뒤에 이모지",
  },
  {
    id: "T-31",
    input: "*특수문자뒤에공백(Text)* 입니다",
    expected: "*특수문자뒤에공백(Text)* 입니다",
    desc: "기울임(*) 닫는 기호 뒤에 공백",
  },
  {
    id: "T-32",
    input: "*특수문자뒤에문장부호(Text)*.",
    expected: "*특수문자뒤에문장부호(Text)*.",
    desc: "기울임(*) 닫는 기호 뒤에 문장부호",
  },
  {
    id: "T-33",
    input: "`*코드블럭(Text)*입니다`",
    expected: "`*코드블럭(Text)*입니다`",
    desc: "기울임(*) 코드 블록 내부",
  },
  {
    id: "T-34",
    input: "<em>HTML태그사용(Text)</em>입니다",
    expected: "<em>HTML태그사용(Text)</em>입니다",
    desc: "기울임(*) HTML 태그 사용",
  },

  // Italic (_)
  {
    id: "T-35",
    input: "_일반적인한글_입니다",
    expected: "_일반적인한글_ 입니다",
    desc: "기울임(_) 일반 텍스트 + 조사",
  }, // Fail (Rule B)
  {
    id: "T-36",
    input: "_General Text_ is good",
    expected: "_General Text_ is good",
    desc: "기울임(_) 영어 + 공백",
  },
  {
    id: "T-37",
    input: "_괄호가포함된(Text)_ 입니다",
    expected: "_괄호가포함된(Text)_ 입니다",
    desc: "기울임(_) 닫는 특수문자 뒤에 공백",
  },
  {
    id: "T-38",
    input: "_끝이글자로끝남(Text)A_입니다",
    expected: "_끝이글자로끝남(Text)A_ 입니다",
    desc: "기울임(_) 닫는 문자열이 알파벳",
  }, // Fail (Rule B)
  {
    id: "T-39",
    input: "_괄호로끝남(Text)_입니다",
    expected: "_괄호로끝남(Text)_ 입니다",
    desc: "기울임(_) 닫는 기호 + 한글",
  },
  {
    id: "T-40",
    input: "_대괄호로끝남[Text]_입니다",
    expected: "_대괄호로끝남[Text]_ 입니다",
    desc: "기울임(_) 대괄호 + 한글",
  },
  {
    id: "T-41",
    input: "_중괄호로끝남{Text}_입니다",
    expected: "_중괄호로끝남{Text}_ 입니다",
    desc: "기울임(_) 중괄호 + 한글",
  },
  {
    id: "T-42",
    input: '_따옴표로끝남"Text"_입니다',
    expected: '_따옴표로끝남"Text"_ 입니다',
    desc: "기울임(_) 따옴표 + 한글",
  },
  {
    id: "T-43",
    input: "_마침표로끝남._입니다",
    expected: "_마침표로끝남._ 입니다",
    desc: "기울임(_) 마침표 + 한글",
  },
  {
    id: "T-44",
    input: "_느낌표로끝남!_입니다",
    expected: "_느낌표로끝남!_ 입니다",
    desc: "기울임(_) 느낌표 + 한글",
  },
  {
    id: "T-45",
    input: "_물음표로끝남?_입니다",
    expected: "_물음표로끝남?_ 입니다",
    desc: "기울임(_) 물음표 + 한글",
  },
  {
    id: "T-46",
    input: "_특수문자뒤에숫자(Text)_123",
    expected: "_특수문자뒤에숫자(Text)_ 123",
    desc: "기울임(_) 닫는 기호 뒤에 숫자",
  },
  {
    id: "T-47",
    input: "_특수문자뒤에이모지(Text)_✅",
    expected: "_특수문자뒤에이모지(Text)_ ✅",
    desc: "기울임(_) 닫는 기호 뒤에 이모지",
  },
  {
    id: "T-48",
    input: "_특수문자뒤에공백(Text)_ 입니다",
    expected: "_특수문자뒤에공백(Text)_ 입니다",
    desc: "기울임(_) 닫는 기호 뒤에 공백",
  },
  {
    id: "T-49",
    input: "_특수문자뒤에문장부호(Text)_.",
    expected: "_특수문자뒤에문장부호(Text)_.",
    desc: "기울임(_) 닫는 기호 뒤에 문장부호",
  },
  {
    id: "T-50",
    input: "`_코드블럭(Text)_입니다`",
    expected: "`_코드블럭(Text)_입니다`",
    desc: "기울임(_) 코드 블록 내부",
  },
  {
    id: "T-51",
    input: "<i>HTML태그사용(Text)</i>입니다",
    expected: "<i>HTML태그사용(Text)</i>입니다",
    desc: "기울임(_) HTML 태그 사용",
  },

  // Strikethrough (~~)
  {
    id: "T-52",
    input: "~~일반적인한글~~입니다",
    expected: "~~일반적인한글~~입니다",
    desc: "취소선 일반 텍스트 + 조사",
  },
  {
    id: "T-53",
    input: "~~General Text~~ is good",
    expected: "~~General Text~~ is good",
    desc: "취소선 영어 + 공백",
  },
  {
    id: "T-54",
    input: "~~괄호가포함된(Text)~~ 입니다",
    expected: "~~괄호가포함된(Text)~~ 입니다",
    desc: "취소선 닫는 특수문자 뒤에 공백",
  },
  {
    id: "T-55",
    input: "~~끝이글자로끝남(Text)A~~입니다",
    expected: "~~끝이글자로끝남(Text)A~~입니다",
    desc: "취소선 닫는 문자열이 알파벳",
  },
  {
    id: "T-56",
    input: "~~괄호로끝남(Text)~~입니다",
    expected: "~~괄호로끝남(Text)~~ 입니다",
    desc: "취소선 닫는 기호 + 한글",
  },
  {
    id: "T-57",
    input: "~~대괄호로끝남[Text]~~입니다",
    expected: "~~대괄호로끝남[Text]~~ 입니다",
    desc: "취소선 대괄호 + 한글",
  },
  {
    id: "T-58",
    input: "~~중괄호로끝남{Text}~~입니다",
    expected: "~~중괄호로끝남{Text}~~ 입니다",
    desc: "취소선 중괄호 + 한글",
  },
  {
    id: "T-59",
    input: '~~따옴표로끝남"Text"~~입니다',
    expected: '~~따옴표로끝남"Text"~~ 입니다',
    desc: "취소선 따옴표 + 한글",
  },
  {
    id: "T-60",
    input: "~~마침표로끝남.~~입니다",
    expected: "~~마침표로끝남.~~ 입니다",
    desc: "취소선 마침표 + 한글",
  },
  {
    id: "T-61",
    input: "~~느낌표로끝남!~~입니다",
    expected: "~~느낌표로끝남!~~ 입니다",
    desc: "취소선 느낌표 + 한글",
  },
  {
    id: "T-62",
    input: "~~물음표로끝남?~~입니다",
    expected: "~~물음표로끝남?~~ 입니다",
    desc: "취소선 물음표 + 한글",
  },
  {
    id: "T-63",
    input: "~~특수문자뒤에숫자(Text)~~123",
    expected: "~~특수문자뒤에숫자(Text)~~ 123",
    desc: "취소선 닫는 기호 뒤에 숫자",
  },
  {
    id: "T-64",
    input: "~~특수문자뒤에이모지(Text)~~✅",
    expected: "~~특수문자뒤에이모지(Text)~~ ✅",
    desc: "취소선 닫는 기호 뒤에 이모지",
  },
  {
    id: "T-65",
    input: "~~특수문자뒤에공백(Text)~~ 입니다",
    expected: "~~특수문자뒤에공백(Text)~~ 입니다",
    desc: "취소선 닫는 기호 뒤에 공백",
  },
  {
    id: "T-66",
    input: "~~특수문자뒤에문장부호(Text)~~.",
    expected: "~~특수문자뒤에문장부호(Text)~~.",
    desc: "취소선 닫는 기호 뒤에 문장부호",
  },
  {
    id: "T-67",
    input: "`~~코드블럭(Text)~~입니다`",
    expected: "`~~코드블럭(Text)~~입니다`",
    desc: "취소선 코드 블록 내부",
  },
  {
    id: "T-68",
    input: "<s>HTML태그사용(Text)</s>입니다",
    expected: "<s>HTML태그사용(Text)</s>입니다",
    desc: "취소선 HTML 태그 사용",
  },
];

describe("KoreanMarkdownFixer", () => {
  const fixer = new KoreanMarkdownFixer();

  testCases.forEach(({ id, input, expected, desc }) => {
    it(`${id}: ${desc}`, () => {
      const result = fixer.fix(input);
      expect(result).toBe(expected);
    });
  });

  it("should handle multiple occurrences in one line", () => {
    const input = "**1)**한글 **2)**한글";
    const expected = "**1)** 한글 **2)** 한글";
    expect(fixer.fix(input)).toBe(expected);
  });

  it("should handle mixed types in one line", () => {
    const input = "**bold)**한글 and _italic_한글";
    const expected = "**bold)** 한글 and _italic_ 한글";
    expect(fixer.fix(input)).toBe(expected);
  });
});
