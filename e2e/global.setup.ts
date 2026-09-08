import { test as setup } from "@playwright/test";
import { API_BASE_URL, waitForApi } from "./lib/api";

setup("backend is ready", async () => {
  const { instance, config } = await waitForApi();
  if (!instance.is_setup_done) {
    throw new Error(
      `Plane instance at ${API_BASE_URL} has not completed setup (no instance admin). ` +
        "Seed it with e2e/fixtures/seed.py (see e2e/README.md)."
    );
  }
  if (!config.is_email_password_enabled) {
    throw new Error("Email/password authentication is disabled on the instance; the auth specs need it enabled.");
  }
});
