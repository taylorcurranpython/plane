/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
import type { TInstanceObservability, TWorkspaceObservability } from "@plane/types";
import { APIService } from "../api.service";

/**
 * Service class for retrieving observability metrics
 * @extends APIService
 */
export class ObservabilityService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves instance-wide observability metrics (instance admins only)
   * @returns {Promise<TInstanceObservability>}
   * @throws {Error} If the API request fails
   */
  async instance(): Promise<TInstanceObservability> {
    return this.get("/api/instances/observability/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Retrieves observability metrics for a workspace
   * @param {string} workspaceSlug - The workspace slug
   * @returns {Promise<TWorkspaceObservability>}
   * @throws {Error} If the API request fails
   */
  async workspace(workspaceSlug: string): Promise<TWorkspaceObservability> {
    return this.get(`/api/workspaces/${workspaceSlug}/observability/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
