/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAxiosInstance, mockCreate, resetMockAxios } from "./test-utils/mock-axios";
import { APIService } from "./api.service";

vi.mock("axios", async (importOriginal) => (await import("./test-utils/mock-axios")).axiosMockFactory(importOriginal));

class TestService extends APIService {
  constructor() {
    super("https://api.example.com");
  }
}

describe("APIService", () => {
  beforeEach(() => {
    resetMockAxios();
  });

  it("creates an axios instance with credentials for the base url", () => {
    const service = new TestService();
    expect(service).toBeInstanceOf(TestService);
    expect(mockCreate).toHaveBeenCalledWith({ baseURL: "https://api.example.com", withCredentials: true });
  });

  it("merges params and config for GET requests", async () => {
    const service = new TestService();
    await service.get("/x/", { params: { a: 1 } }, { headers: { "X-Test": "1" } });
    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/x/", { params: { a: 1 }, headers: { "X-Test": "1" } });
  });

  it("passes body and config through for write verbs", async () => {
    const service = new TestService();
    await service.post("/x/", { a: 1 }, { timeout: 5 });
    await service.put("/x/", { b: 2 });
    await service.patch("/x/", { c: 3 });
    await service.delete("/x/", { d: 4 }, { timeout: 1 });

    expect(mockAxiosInstance.post).toHaveBeenCalledWith("/x/", { a: 1 }, { timeout: 5 });
    expect(mockAxiosInstance.put).toHaveBeenCalledWith("/x/", { b: 2 }, {});
    expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/x/", { c: 3 }, {});
    expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/x/", { data: { d: 4 }, timeout: 1 });
  });
});
