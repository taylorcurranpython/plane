import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const trimSlash = (url: string) => url.replace(/\/+$/, "");

export const WEB_URL = trimSlash(process.env.E2E_WEB_URL ?? "http://localhost:3000");
export const API_URL = trimSlash(process.env.E2E_API_URL ?? "http://localhost:8000");

export const AUTH_DIR = path.join(here, "..", ".auth");
export const AUTH_STATE_PATH = path.join(AUTH_DIR, "user.json");
export const SESSION_PATH = path.join(AUTH_DIR, "session.json");

/** Instance admin created (once) by the setup project if the instance is not yet configured. */
export const INSTANCE_ADMIN = {
  email: process.env.E2E_INSTANCE_ADMIN_EMAIL ?? "e2e-admin@plane.local",
  password: process.env.E2E_INSTANCE_ADMIN_PASSWORD ?? "E2e-instance-admin-p4ssw0rd!",
  firstName: "E2E",
  lastName: "Admin",
  companyName: "Plane E2E",
};

/** Password used for the user the suite signs up. Must satisfy zxcvbn score >= 3. */
export const TEST_USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? "Pl4ywright-e2e-s3cret!";
