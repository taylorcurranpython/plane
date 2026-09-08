/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import {
  addSpaceIfCamelCase,
  capitalizeFirstLetter,
  checkEmailValidity,
  checkURLValidity,
  createSimilarString,
  ensureUrlHasProtocol,
  getFirstCharacters,
  getNumberCount,
  isCommentEmpty,
  isEmptyHtmlString,
  isJSONContentEmpty,
  isStringCommentEmpty,
  joinUrlPath,
  joinWithConjunction,
  replaceUnderscoreIfSnakeCase,
  sanitizeHTML,
  stripAndTruncateHTML,
  substringMatch,
  truncateText,
} from "./string";

describe("addSpaceIfCamelCase", () => {
  it("adds spaces between camelCase words", () => {
    expect(addSpaceIfCamelCase("camelCase")).toBe("camel Case");
    expect(addSpaceIfCamelCase("thisIsATest")).toBe("this Is ATest");
  });

  it("returns an empty string for null or undefined", () => {
    expect(addSpaceIfCamelCase(undefined as unknown as string)).toBe("");
    expect(addSpaceIfCamelCase(null as unknown as string)).toBe("");
  });
});

describe("replaceUnderscoreIfSnakeCase", () => {
  it("replaces every underscore", () => {
    expect(replaceUnderscoreIfSnakeCase("snake_case_here")).toBe("snake case here");
  });
});

describe("truncateText", () => {
  it("truncates and appends an ellipsis", () => {
    expect(truncateText("This is a long text", 7)).toBe("This is...");
  });

  it("returns the original text when short enough", () => {
    expect(truncateText("short", 10)).toBe("short");
    expect(truncateText("", 10)).toBe("");
  });
});

describe("createSimilarString", () => {
  it("keeps the same characters", () => {
    expect(createSimilarString("hello").split("").toSorted()).toEqual("hello".split("").toSorted());
  });
});

describe("getFirstCharacters", () => {
  it("returns initials", () => {
    expect(getFirstCharacters("John")).toBe("J");
    expect(getFirstCharacters("John Doe")).toBe("JD");
    expect(getFirstCharacters("  John Doe Smith ")).toBe("JD");
  });
});

describe("getNumberCount", () => {
  it("caps at 99+", () => {
    expect(getNumberCount(50)).toBe("50");
    expect(getNumberCount(99)).toBe("99");
    expect(getNumberCount(100)).toBe("99+");
  });
});

describe("capitalizeFirstLetter", () => {
  it("capitalizes only the first letter", () => {
    expect(capitalizeFirstLetter("hello world")).toBe("Hello world");
  });
});

describe("sanitizeHTML / stripAndTruncateHTML", () => {
  it("strips tags and trims", () => {
    expect(sanitizeHTML("<p> Some <b>text</b> </p>")).toBe("Some text");
  });

  it("strips and truncates", () => {
    expect(stripAndTruncateHTML("<p>Some very long text</p>", 4)).toBe("Some...");
    expect(stripAndTruncateHTML("<p>Short</p>")).toBe("Short");
  });
});

describe("checkEmailValidity", () => {
  it("validates emails", () => {
    expect(checkEmailValidity("example@plane.so")).toBe(true);
    expect(checkEmailValidity("hello world")).toBe(false);
    expect(checkEmailValidity("")).toBe(false);
  });
});

describe("isEmptyHtmlString", () => {
  it("treats tag-only markup as empty", () => {
    expect(isEmptyHtmlString("<p></p>")).toBe(true);
    expect(isEmptyHtmlString("<p>text</p>")).toBe(false);
  });

  it("keeps allowed tags as content", () => {
    expect(isEmptyHtmlString('<p><img src="x" /></p>', ["img"])).toBe(false);
  });
});

describe("isJSONContentEmpty", () => {
  it("handles undefined and text nodes", () => {
    expect(isJSONContentEmpty(undefined)).toBe(true);
    expect(isJSONContentEmpty({ type: "text", text: "   " })).toBe(true);
    expect(isJSONContentEmpty({ type: "text", text: "hi" })).toBe(false);
  });

  it("treats empty paragraphs and docs as empty", () => {
    expect(isJSONContentEmpty({ type: "paragraph" })).toBe(true);
    expect(isJSONContentEmpty({ type: "doc", content: [] })).toBe(true);
  });

  it("treats media and mentions as meaningful", () => {
    expect(isJSONContentEmpty({ type: "image" })).toBe(false);
    expect(isJSONContentEmpty({ type: "mention-component" })).toBe(false);
    expect(isJSONContentEmpty({ type: "hardBreak" })).toBe(false);
    expect(isJSONContentEmpty({ type: "codeBlock" })).toBe(true);
  });

  it("recurses into nested content", () => {
    expect(
      isJSONContentEmpty({
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
      })
    ).toBe(true);
    expect(
      isJSONContentEmpty({
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "x" }] }],
      })
    ).toBe(false);
  });
});

describe("isCommentEmpty", () => {
  it("handles string content", () => {
    expect(isCommentEmpty(undefined)).toBe(true);
    expect(isCommentEmpty("")).toBe(true);
    expect(isCommentEmpty("<p></p>")).toBe(true);
    expect(isCommentEmpty("<p>hi</p>")).toBe(false);
    expect(isCommentEmpty('<p><img src="x" /></p>')).toBe(false);
  });

  it("handles JSON content and arrays", () => {
    expect(isCommentEmpty([])).toBe(true);
    expect(isCommentEmpty([{ type: "paragraph" }])).toBe(true);
    expect(isCommentEmpty([{ type: "text", text: "hi" }])).toBe(false);
    expect(isCommentEmpty({ type: "doc", content: [{ type: "text", text: "hi" }] })).toBe(false);
  });
});

describe("isStringCommentEmpty", () => {
  it("mirrors the legacy behaviour", () => {
    expect(isStringCommentEmpty(undefined)).toBe(true);
    expect(isStringCommentEmpty("<p></p>")).toBe(true);
    expect(isStringCommentEmpty("<embed-component></embed-component>")).toBe(false);
    expect(isStringCommentEmpty("<p>hi</p>")).toBe(false);
  });
});

describe("checkURLValidity", () => {
  it("accepts URLs with or without a protocol", () => {
    expect(checkURLValidity("https://example.com")).toBe(true);
    expect(checkURLValidity("example.com")).toBe(true);
    expect(checkURLValidity("http://192.168.0.1:8080/path?x=1#frag")).toBe(true);
  });

  it("rejects invalid URLs", () => {
    expect(checkURLValidity("example")).toBe(false);
    expect(checkURLValidity("")).toBe(false);
  });
});

describe("joinWithConjunction", () => {
  it("joins with separator and conjunction", () => {
    expect(joinWithConjunction([])).toBe("");
    expect(joinWithConjunction(["a"])).toBe("a");
    expect(joinWithConjunction(["a", "b"])).toBe("a and b");
    expect(joinWithConjunction(["a", "b", "c"])).toBe("a, b, and c");
    expect(joinWithConjunction(["a", "b", "c"], "; ", "or")).toBe("a; b; or c");
  });
});

describe("ensureUrlHasProtocol", () => {
  it("prefixes http:// when missing", () => {
    expect(ensureUrlHasProtocol("example.com")).toBe("http://example.com");
    expect(ensureUrlHasProtocol("https://example.com")).toBe("https://example.com");
  });
});

describe("substringMatch", () => {
  it("matches characters in order, case-insensitively", () => {
    expect(substringMatch("hello world", "hlo")).toBe(true);
    expect(substringMatch("Hello World", "HW")).toBe(true);
    expect(substringMatch("hello world", "hoe")).toBe(false);
    expect(substringMatch("", "a")).toBe(false);
  });
});

describe("joinUrlPath", () => {
  it("normalizes slashes between segments", () => {
    expect(joinUrlPath("/workspace", "/projects")).toBe("/workspace/projects");
    expect(joinUrlPath("/workspace", "projects")).toBe("/workspace/projects");
    expect(joinUrlPath("workspace", "projects")).toBe("/workspace/projects");
    expect(joinUrlPath("/workspace/", "/projects/")).toBe("/workspace/projects/");
  });

  it("ignores empty segments", () => {
    expect(joinUrlPath()).toBe("");
    expect(joinUrlPath("", "")).toBe("");
    expect(joinUrlPath("", "/a", "", "b")).toBe("/a/b");
  });
});
