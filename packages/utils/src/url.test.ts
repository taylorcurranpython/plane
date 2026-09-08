/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import {
  extractHostname,
  extractTLD,
  extractURLComponents,
  formatURLForDisplay,
  isLocalhost,
  isValidIPv4,
  isValidIPv6,
  isValidNextPath,
  processURL,
  validateIPAddress,
} from "./url";

describe("isValidIPv4", () => {
  it("validates dotted quads", () => {
    expect(isValidIPv4("192.168.0.1")).toBe(true);
    expect(isValidIPv4("255.255.255.255")).toBe(true);
    expect(isValidIPv4("256.0.0.1")).toBe(false);
    expect(isValidIPv4("1.2.3")).toBe(false);
    expect(isValidIPv4("")).toBe(false);
  });
});

describe("isValidIPv6", () => {
  it("validates IPv6 addresses with and without brackets", () => {
    expect(isValidIPv6("::1")).toBe(true);
    expect(isValidIPv6("[::1]")).toBe(true);
    expect(isValidIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
    expect(isValidIPv6("not-an-ip")).toBe(false);
    expect(isValidIPv6("")).toBe(false);
  });
});

describe("validateIPAddress", () => {
  it("classifies the address type", () => {
    expect(validateIPAddress("10.0.0.1")).toEqual({ isValid: true, type: "ipv4", formatted: "10.0.0.1" });
    expect(validateIPAddress("[::1]")).toEqual({ isValid: true, type: "ipv6", formatted: "::1" });
    expect(validateIPAddress("nope")).toEqual({ isValid: false, type: "invalid" });
    expect(validateIPAddress("")).toEqual({ isValid: false, type: "invalid" });
  });
});

describe("extractHostname / isLocalhost", () => {
  it("strips protocol, port, path, query and hash", () => {
    expect(extractHostname("https://user:pass@example.com:8080/path?q=1#h")).toBe("example.com");
    expect(extractHostname("example.com/path")).toBe("example.com");
  });

  it("detects localhost addresses", () => {
    expect(isLocalhost("http://localhost:3000")).toBe(true);
    expect(isLocalhost("127.0.0.1")).toBe(true);
    expect(isLocalhost("https://example.com")).toBe(false);
  });
});

describe("formatURLForDisplay", () => {
  it("returns the host for valid URLs and a cleaned hostname otherwise", () => {
    expect(formatURLForDisplay("https://example.com/path/")).toBe("example.com");
    expect(formatURLForDisplay("example.com/path/")).toBe("example.com");
    expect(formatURLForDisplay("")).toBe("");
  });
});

describe("extractTLD", () => {
  it("returns known TLDs only", () => {
    expect(extractTLD("https://blog.example.com/posts")).toBe("com");
    expect(extractTLD("example.ORG")).toBe("org");
    expect(extractTLD("example.notatld")).toBe("");
    expect(extractTLD("localhost")).toBe("");
    expect(extractTLD(".example.com")).toBe("");
    expect(extractTLD("example.com.")).toBe("");
  });
});

describe("processURL", () => {
  it("splits a URL into components", () => {
    const result = processURL(new URL("https://blog.example.com/posts"));
    expect(result).toMatchObject({
      protocol: "https",
      subdomain: "blog",
      rootDomain: "example",
      tld: "com",
      pathname: "/posts",
    });
    expect(result.full).toBeInstanceOf(URL);
  });

  it("handles single-label hosts and root paths", () => {
    expect(processURL(new URL("http://localhost/"))).toMatchObject({
      subdomain: "",
      rootDomain: "localhost",
      tld: "",
      pathname: "",
    });
  });
});

describe("extractURLComponents", () => {
  it("accepts URL objects", () => {
    expect(extractURLComponents(new URL("https://example.com"))?.rootDomain).toBe("example");
  });

  it("parses protocol-less domains, IPs and emails", () => {
    expect(extractURLComponents("blog.example.com/posts")).toMatchObject({
      protocol: "http",
      subdomain: "blog",
      rootDomain: "example",
      tld: "com",
      pathname: "/posts",
    });
    expect(extractURLComponents("192.168.1.1")?.protocol).toBe("http");
    expect(extractURLComponents("localhost")?.rootDomain).toBe("localhost");
    expect(extractURLComponents("john@example.com")?.protocol).toBe("mailto");
    expect(extractURLComponents("ftp://files.example.com")?.protocol).toBe("ftp");
  });

  it("returns undefined for invalid input", () => {
    expect(extractURLComponents("")).toBeUndefined();
    expect(extractURLComponents("   ")).toBeUndefined();
    expect(extractURLComponents("not a url")).toBeUndefined();
    expect(extractURLComponents(`https://${"a".repeat(2050)}.com`)).toBeUndefined();
  });
});

describe("isValidNextPath", () => {
  it("accepts relative paths", () => {
    expect(isValidNextPath("/dashboard")).toBe(true);
    expect(isValidNextPath("/workspace/123?x=1")).toBe(true);
    expect(isValidNextPath("  /dashboard  ")).toBe(true);
  });

  it("rejects open-redirect and injection attempts", () => {
    expect(isValidNextPath("https://malicious.com")).toBe(false);
    expect(isValidNextPath("//malicious.com")).toBe(false);
    expect(isValidNextPath("javascript:alert(1)")).toBe(false);
    expect(isValidNextPath("")).toBe(false);
    expect(isValidNextPath("dashboard")).toBe(false);
    expect(isValidNextPath("\\malicious")).toBe(false);
    expect(isValidNextPath("/path/javascript:alert(1)")).toBe(false);
    expect(isValidNextPath(undefined as unknown as string)).toBe(false);
  });
});
