# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""
Seed the minimum data the Playwright E2E suite needs to sign in through the web app:
an onboarded user, a workspace the user administers, and an instance admin so the
instance reports `is_setup_done` (otherwise the web app shows "instance not ready").

Run from apps/api with the Django environment loaded (the instance must already be
registered via `python manage.py register_instance <machine-signature>`):

    python manage.py shell < /path/to/e2e/fixtures/seed.py

Idempotent: re-running reuses the existing rows and resets the user's password.
Values resolve as: E2E_* shell variables > the dotenv file at E2E_ENV_FILE (default /e2e/.env,
see docker-compose-e2e.yml) > the defaults below -- the same order playwright.config.ts uses.
"""

import os
import uuid
from pathlib import Path

from django.contrib.auth.hashers import make_password
from plane.db.models import Profile, User, Workspace, WorkspaceMember
from plane.license.models import Instance, InstanceAdmin


def load_env_file(path: Path) -> None:
    """Minimal dotenv reader (KEY=value, optional quotes, # comments); never overrides the shell."""
    if not path.is_file():
        return
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip().removeprefix("export ").strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        if key.startswith("E2E_"):
            os.environ.setdefault(key, value)


load_env_file(Path(os.environ.get("E2E_ENV_FILE", "/e2e/.env")))

EMAIL = os.environ.get("E2E_USER_EMAIL", "e2e@plane.local")
PASSWORD = os.environ.get("E2E_USER_PASSWORD", "e2e-password-1234!")
WORKSPACE_SLUG = os.environ.get("E2E_WORKSPACE_SLUG", "e2e")
WORKSPACE_NAME = os.environ.get("E2E_WORKSPACE_NAME", "E2E")

WORKSPACE_ADMIN_ROLE = 20

user, _ = User.objects.get_or_create(
    email=EMAIL,
    defaults={
        "username": uuid.uuid4().hex,
        "first_name": "E2E",
        "last_name": "Runner",
    },
)
# Always reset credentials/state so a rerun against a long-lived dev DB matches e2e/.env.
user.password = make_password(PASSWORD)
user.is_active = True
user.is_password_autoset = False
user.save(update_fields=["password", "is_active", "is_password_autoset"])

workspace, _ = Workspace.objects.get_or_create(
    slug=WORKSPACE_SLUG,
    defaults={"name": WORKSPACE_NAME, "owner": user},
)
WorkspaceMember.objects.get_or_create(
    workspace=workspace,
    member=user,
    defaults={"role": WORKSPACE_ADMIN_ROLE, "is_active": True},
)

profile, _ = Profile.objects.get_or_create(user=user)
profile.is_onboarded = True
profile.last_workspace_id = workspace.id
profile.onboarding_step = {
    "workspace_join": True,
    "profile_complete": True,
    "workspace_create": True,
    "workspace_invite": True,
}
profile.save()

instance = Instance.objects.first()
if instance is None:
    raise SystemExit(
        "No Instance row found; run `python manage.py register_instance <signature>` first."
    )
InstanceAdmin.objects.get_or_create(
    user=user, instance=instance, defaults={"role": WORKSPACE_ADMIN_ROLE}
)
if not instance.is_setup_done:
    instance.is_setup_done = True
    instance.instance_name = instance.instance_name or "Plane E2E"
    instance.save(update_fields=["is_setup_done", "instance_name"])

print(f"E2E_USER_EMAIL={EMAIL}")
print(f"E2E_USER_ID={user.id}")
print(f"E2E_WORKSPACE_SLUG={workspace.slug}")
print(f"E2E_INSTANCE_SETUP_DONE={instance.is_setup_done}")
