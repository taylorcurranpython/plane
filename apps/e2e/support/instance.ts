/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { request, type APIRequestContext } from "@playwright/test";
import { API_URL, INSTANCE_ADMIN, WEB_URL } from "./env";

type InstanceResponse = {
  instance: { is_setup_done: boolean };
  config: { is_email_password_enabled: boolean; enable_signup: boolean };
};

const getInstance = async (api: APIRequestContext) => {
  const res = await api.get(`${API_URL}/api/instances/`);
  if (!res.ok()) throw new Error(`GET /api/instances/ failed: ${res.status()} ${await res.text()}`);
  return (await res.json()) as InstanceResponse;
};

const getCsrfToken = async (api: APIRequestContext) => {
  const res = await api.get(`${API_URL}/auth/get-csrf-token/`);
  if (!res.ok()) throw new Error(`GET /auth/get-csrf-token/ failed: ${res.status()}`);
  const body = (await res.json()) as { csrf_token: string };
  return body.csrf_token;
};

/**
 * A freshly migrated Plane instance has no instance admin and the web app shows
 * "instance not ready" until one is created through God Mode. Creating the admin
 * through the same form endpoint God Mode uses lets the suite run against a
 * clean database without manual steps. No-op when setup is already done.
 */
export const ensureInstanceIsSetUp = async () => {
  const api = await request.newContext();
  try {
    const before = await getInstance(api);
    if (!before.instance.is_setup_done) {
      const csrfToken = await getCsrfToken(api);
      const res = await api.post(`${API_URL}/api/instances/admins/sign-up/`, {
        headers: { Referer: `${WEB_URL}/`, Origin: WEB_URL },
        form: {
          csrfmiddlewaretoken: csrfToken,
          email: INSTANCE_ADMIN.email,
          password: INSTANCE_ADMIN.password,
          first_name: INSTANCE_ADMIN.firstName,
          last_name: INSTANCE_ADMIN.lastName,
          company_name: INSTANCE_ADMIN.companyName,
        },
        maxRedirects: 0,
      });
      if (res.status() >= 400) {
        throw new Error(`Instance admin sign-up failed: ${res.status()} ${await res.text()}`);
      }
      const location = res.headers()["location"] ?? "";
      if (location.includes("error_code")) {
        throw new Error(`Instance admin sign-up was rejected: ${location}`);
      }
    }

    const after = await getInstance(api);
    if (!after.instance.is_setup_done) throw new Error("Instance setup did not complete.");
    if (!after.config.enable_signup)
      throw new Error("Sign-up is disabled on this instance; the suite needs it enabled.");
    if (!after.config.is_email_password_enabled) {
      throw new Error("Email/password auth is disabled on this instance; the suite needs it enabled.");
    }
  } finally {
    await api.dispose();
  }
};
