/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { axiosError, axiosResponse, mockAxiosInstance, resetMockAxios } from "../test-utils/mock-axios";
import { WorkspaceService } from "./workspace.service";

vi.mock("axios", async (importOriginal) => (await import("../test-utils/mock-axios")).axiosMockFactory(importOriginal));

describe("WorkspaceService", () => {
  const service = new WorkspaceService("https://api.example.com");

  beforeEach(() => {
    resetMockAxios();
  });

  it("list() fetches the current user's workspaces", async () => {
    mockAxiosInstance.get.mockResolvedValue(axiosResponse([{ id: "1" }]));
    await expect(service.list()).resolves.toEqual([{ id: "1" }]);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/users/me/workspaces/", {});
  });

  it("retrieve() builds the workspace url", async () => {
    mockAxiosInstance.get.mockResolvedValue(axiosResponse({ slug: "acme" }));
    await expect(service.retrieve("acme")).resolves.toEqual({ slug: "acme" });
    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/workspaces/acme/", {});
  });

  it("create() posts the payload", async () => {
    mockAxiosInstance.post.mockResolvedValue(axiosResponse({ id: "new" }));
    await expect(service.create({ name: "Acme" })).resolves.toEqual({ id: "new" });
    expect(mockAxiosInstance.post).toHaveBeenCalledWith("/api/workspaces/", { name: "Acme" }, {});
  });

  it("update() patches and destroy() deletes", async () => {
    mockAxiosInstance.patch.mockResolvedValue(axiosResponse({ name: "Renamed" }));
    mockAxiosInstance.delete.mockResolvedValue(axiosResponse(null, 204));

    await expect(service.update("acme", { name: "Renamed" })).resolves.toEqual({ name: "Renamed" });
    expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/api/workspaces/acme/", { name: "Renamed" }, {});

    await expect(service.destroy("acme")).resolves.toBeNull();
    expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/api/workspaces/acme/", { data: undefined });
  });

  it("slugCheck() serialises the slug into the query string", async () => {
    mockAxiosInstance.get.mockResolvedValue(axiosResponse({ status: true }));
    await service.slugCheck("my-slug");
    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/workspace-slug-check/?slug=my-slug", {});
  });

  it("search() forwards params via axios config", async () => {
    mockAxiosInstance.get.mockResolvedValue(axiosResponse({ results: {} }));
    const params = { search: "bug", workspace_search: true };
    await service.search("acme", params);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/workspaces/acme/search/", { params });
  });

  it("rethrows the response body on failure", async () => {
    mockAxiosInstance.post.mockRejectedValue(axiosError({ error: "Slug taken" }));
    await expect(service.create({ slug: "taken" })).rejects.toEqual({ error: "Slug taken" });
  });

  it("retrieve() rethrows the whole response so callers can read the status", async () => {
    mockAxiosInstance.get.mockRejectedValue(axiosError({ detail: "Not found" }, 404));
    await expect(service.retrieve("missing")).rejects.toEqual({ data: { detail: "Not found" }, status: 404 });
  });
});
