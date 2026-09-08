# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""
Seed the minimum data the Karate suite needs to talk to the public REST API:
a user, a workspace the user administers, and an API token bound to both.

Run from apps/api with the Django environment loaded:

    python manage.py shell < tests/karate/fixtures/seed.py

Idempotent: re-running reuses the existing rows so the API key stays stable.
All values can be overridden via environment variables (see below).
"""

import os
import uuid

from django.contrib.auth.hashers import make_password

from plane.db.models import APIToken, Profile, User, Workspace, WorkspaceMember

EMAIL = os.environ.get("KARATE_USER_EMAIL", "karate@plane.local")
PASSWORD = os.environ.get("KARATE_USER_PASSWORD", "karate-password-1234!")
WORKSPACE_SLUG = os.environ.get("KARATE_WORKSPACE_SLUG", "karate")
WORKSPACE_NAME = os.environ.get("KARATE_WORKSPACE_NAME", "Karate")
API_KEY = os.environ.get("KARATE_API_KEY", "plane_api_karate_" + uuid.uuid4().hex)
RATE_LIMIT = os.environ.get("KARATE_API_RATE_LIMIT", "10000/minute")

WORKSPACE_ADMIN_ROLE = 20

user, created = User.objects.get_or_create(
    email=EMAIL,
    defaults={
        "username": uuid.uuid4().hex,
        "password": make_password(PASSWORD),
        "first_name": "Karate",
        "last_name": "Runner",
        "is_active": True,
        "is_password_autoset": False,
    },
)
Profile.objects.get_or_create(user=user, defaults={"is_onboarded": True})

workspace, _ = Workspace.objects.get_or_create(
    slug=WORKSPACE_SLUG,
    defaults={"name": WORKSPACE_NAME, "owner": user},
)
WorkspaceMember.objects.get_or_create(
    workspace=workspace,
    member=user,
    defaults={"role": WORKSPACE_ADMIN_ROLE, "is_active": True},
)

token, _ = APIToken.objects.get_or_create(
    token=API_KEY,
    defaults={
        "label": "karate",
        "description": "Karate behaviour test suite",
        "user": user,
        "workspace": workspace,
        "is_active": True,
        "allowed_rate_limit": RATE_LIMIT,
    },
)

print(f"KARATE_USER_EMAIL={EMAIL}")
print(f"KARATE_USER_ID={user.id}")
print(f"KARATE_WORKSPACE_SLUG={workspace.slug}")
print(f"KARATE_API_TOKEN_ID={token.id} (active={token.is_active}, rate_limit={token.allowed_rate_limit})")
