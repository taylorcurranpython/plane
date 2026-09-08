# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
from datetime import timedelta

# Django imports
from django.db.models import Count, Q, QuerySet
from django.db.models.functions import TruncDate
from django.utils import timezone

# Module imports
from plane.db.models import (
    Cycle,
    Issue,
    IssueActivity,
    Module,
    Page,
    Project,
    User,
    Workspace,
    WorkspaceMember,
)
from plane.db.models.state import StateGroup

ACTIVITY_WINDOW_DAYS = 14
STATE_GROUPS = [
    StateGroup.BACKLOG.value,
    StateGroup.UNSTARTED.value,
    StateGroup.STARTED.value,
    StateGroup.COMPLETED.value,
    StateGroup.CANCELLED.value,
]


def _issues_by_state_group(issues: QuerySet) -> dict:
    grouped = issues.values("state__group").annotate(count=Count("id"))
    counts = {group: 0 for group in STATE_GROUPS}
    for row in grouped:
        group = row["state__group"]
        if group in counts:
            counts[group] = row["count"]
    return counts


def _issues_by_priority(issues: QuerySet) -> dict:
    counts = {priority: 0 for priority, _ in Issue.PRIORITY_CHOICES}
    for row in issues.values("priority").annotate(count=Count("id")):
        if row["priority"] in counts:
            counts[row["priority"]] = row["count"]
    return counts


def _eligible_issue_q(prefix: str) -> Q:
    """Mirror Issue.issue_objects for a related lookup, e.g. prefix="workspace_issue__"."""
    return Q(
        **{
            f"{prefix}deleted_at__isnull": True,
            f"{prefix}archived_at__isnull": True,
            f"{prefix}is_draft": False,
            f"{prefix}project__archived_at__isnull": True,
        }
    ) & ~Q(**{f"{prefix}state__group": StateGroup.TRIAGE.value})


def _eligible_issue_activities(**filters) -> QuerySet:
    return IssueActivity.objects.filter(issue_id__in=Issue.issue_objects.filter(**filters).values("id"))


def _daily_activity(activities: QuerySet, days: int = ACTIVITY_WINDOW_DAYS) -> list:
    today = timezone.now().date()
    start = today - timedelta(days=days - 1)
    rows = (
        activities.filter(created_at__date__gte=start)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
    )
    by_day = {row["day"]: row["count"] for row in rows}
    return [
        {
            "date": (start + timedelta(days=offset)).isoformat(),
            "count": by_day.get(start + timedelta(days=offset), 0),
        }
        for offset in range(days)
    ]


def get_workspace_observability(workspace: Workspace) -> dict:
    issues = Issue.issue_objects.filter(workspace_id=workspace.id)
    now = timezone.now()
    week_ago = now - timedelta(days=7)

    return {
        "workspace": {
            "id": str(workspace.id),
            "name": workspace.name,
            "slug": workspace.slug,
        },
        "totals": {
            "projects": Project.objects.filter(workspace_id=workspace.id, archived_at__isnull=True).count(),
            "members": WorkspaceMember.objects.filter(
                workspace_id=workspace.id, is_active=True, member__is_bot=False
            ).count(),
            "issues": issues.count(),
            "cycles": Cycle.objects.filter(
                workspace_id=workspace.id, archived_at__isnull=True, project__archived_at__isnull=True
            ).count(),
            "modules": Module.objects.filter(
                workspace_id=workspace.id, archived_at__isnull=True, project__archived_at__isnull=True
            ).count(),
            "pages": Page.objects.filter(workspace_id=workspace.id, archived_at__isnull=True).count(),
        },
        "issues": {
            "by_state_group": _issues_by_state_group(issues),
            "by_priority": _issues_by_priority(issues),
            "overdue": issues.filter(
                target_date__lt=now.date(),
                state__group__in=[StateGroup.BACKLOG.value, StateGroup.UNSTARTED.value, StateGroup.STARTED.value],
            ).count(),
            "created_last_7_days": issues.filter(created_at__gte=week_ago).count(),
            "completed_last_7_days": issues.filter(
                completed_at__gte=week_ago, state__group=StateGroup.COMPLETED.value
            ).count(),
        },
        "activity": _daily_activity(_eligible_issue_activities(workspace_id=workspace.id)),
        "generated_at": now.isoformat(),
    }


def get_instance_observability(instance) -> dict:
    issues = Issue.issue_objects.all()
    now = timezone.now()
    week_ago = now - timedelta(days=7)

    return {
        "instance": {
            "instance_id": instance.instance_id,
            "instance_name": instance.instance_name,
            "current_version": instance.current_version,
            "latest_version": instance.latest_version,
            "edition": instance.edition,
            "is_telemetry_enabled": instance.is_telemetry_enabled,
            "is_verified": instance.is_verified,
            "is_setup_done": instance.is_setup_done,
            "last_checked_at": instance.last_checked_at,
        },
        "totals": {
            "users": User.objects.filter(is_bot=False).count(),
            "active_users_last_7_days": User.objects.filter(is_bot=False, last_active__gte=week_ago).count(),
            "workspaces": Workspace.objects.count(),
            "projects": Project.objects.filter(archived_at__isnull=True).count(),
            "issues": issues.count(),
            "cycles": Cycle.objects.filter(archived_at__isnull=True, project__archived_at__isnull=True).count(),
            "modules": Module.objects.filter(archived_at__isnull=True, project__archived_at__isnull=True).count(),
            "pages": Page.objects.filter(archived_at__isnull=True).count(),
        },
        "issues": {
            "by_state_group": _issues_by_state_group(issues),
            "by_priority": _issues_by_priority(issues),
            "created_last_7_days": issues.filter(created_at__gte=week_ago).count(),
            "completed_last_7_days": issues.filter(
                completed_at__gte=week_ago, state__group=StateGroup.COMPLETED.value
            ).count(),
        },
        "top_workspaces": [
            {
                "id": str(row["id"]),
                "name": row["name"],
                "slug": row["slug"],
                "issues": row["issue_count"],
                "members": row["member_count"],
            }
            for row in Workspace.objects.annotate(
                issue_count=Count(
                    "workspace_issue",
                    filter=_eligible_issue_q("workspace_issue__"),
                    distinct=True,
                ),
                member_count=Count(
                    "workspace_member",
                    filter=Q(
                        workspace_member__deleted_at__isnull=True,
                        workspace_member__is_active=True,
                        workspace_member__member__is_bot=False,
                    ),
                    distinct=True,
                ),
            )
            .order_by("-issue_count")
            .values("id", "name", "slug", "issue_count", "member_count")[:5]
        ],
        "activity": _daily_activity(_eligible_issue_activities()),
        "generated_at": now.isoformat(),
    }
