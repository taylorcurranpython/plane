/**
 * Thin wrapper around the Django API used by the E2E suite.
 *
 * The test user / workspace / instance admin are created by the seed script
 * (e2e/fixtures/seed.py) when the backend stack starts, so this module only
 * needs to know the credentials and confirm the backend is healthy.
 */

export const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:8000";

export type TE2EUser = {
  email: string;
  password: string;
  workspaceSlug: string;
};

export const E2E_USER: TE2EUser = {
  email: process.env.E2E_USER_EMAIL ?? "e2e@plane.local",
  password: process.env.E2E_USER_PASSWORD ?? "e2e-password-1234!",
  workspaceSlug: process.env.E2E_WORKSPACE_SLUG ?? "e2e",
};

/** Shape of `GET /api/instances/` (see apps/api/plane/license/api/views/instance.py). */
export type TInstanceInfo = {
  instance: {
    is_activated?: boolean;
    is_setup_done: boolean;
  };
  config: {
    enable_signup?: boolean;
    is_email_password_enabled?: boolean;
    is_magic_login_enabled?: boolean;
  };
};

export const getInstanceInfo = async (): Promise<TInstanceInfo> => {
  const response = await fetch(`${API_BASE_URL}/api/instances/`);
  if (!response.ok) {
    throw new Error(`GET /api/instances/ failed with ${response.status}`);
  }
  return (await response.json()) as TInstanceInfo;
};

/** Returns a unique email so parallel/repeated sign-up runs never collide. */
export const uniqueEmail = (prefix = "e2e-signup") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@plane.local`;

/** Polls the API until it answers, so specs fail fast with a clear message when the stack is down. */
export const waitForApi = async (timeoutMs = 60_000): Promise<TInstanceInfo> => {
  const deadline = Date.now() + timeoutMs;
  const attempt = async (): Promise<TInstanceInfo> => {
    try {
      return await getInstanceInfo();
    } catch (error) {
      if (Date.now() >= deadline) {
        throw new Error(
          `Plane API at ${API_BASE_URL} did not become reachable within ${timeoutMs}ms. ` +
            "Start it with `docker compose -f docker-compose-e2e.yml up -d --wait`.",
          { cause: error }
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      return attempt();
    }
  };
  return attempt();
};
