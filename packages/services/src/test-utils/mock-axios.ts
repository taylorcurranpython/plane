/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { AxiosResponse } from "axios";
import { vi } from "vitest";

/**
 * Shape of the mocked axios instance created by `axios.create`.
 * Each HTTP verb is a `vi.fn()` so tests can assert on the url/params/body a service sends
 * and control the response it receives.
 */
export type TMockAxiosInstance = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

export const mockAxiosInstance: TMockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

export const mockCreate = vi.fn(() => mockAxiosInstance);

/**
 * Module factory for `vi.mock("axios", ...)`. Replaces `axios.create` so every APIService
 * subclass talks to `mockAxiosInstance` instead of the network.
 *
 * @example
 * vi.mock("axios", async (importOriginal) =>
 *   (await import("../test-utils/mock-axios")).axiosMockFactory(importOriginal)
 * );
 * import { WorkspaceService } from "./workspace.service";
 */
export const axiosMockFactory = async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as typeof import("axios");
  return {
    ...actual,
    create: mockCreate,
    default: { ...actual.default, create: mockCreate },
  };
};

export const resetMockAxios = () => {
  for (const fn of Object.values(mockAxiosInstance)) fn.mockReset();
  mockCreate.mockClear();
};

export const axiosResponse = <T>(data: T, status = 200): Partial<AxiosResponse<T>> => ({ data, status });

export const axiosError = (data: unknown, status = 400) => ({ response: { data, status } });
