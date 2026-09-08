# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from plane.db.models import Issue, IssueActivity, Project, ProjectMember, State, User, WorkspaceMember
from plane.license.models import Instance, InstanceAdmin


@pytest.fixture
def project_with_issues(db, workspace, create_user):
    project = Project.objects.create(
        name="Observed Project",
        identifier="OBS",
        workspace=workspace,
        created_by=create_user,
    )
    ProjectMember.objects.create(project=project, workspace=workspace, member=create_user, role=20)
    started = State.objects.create(
        name="In Progress", group="started", color="#000", project=project, workspace=workspace
    )
    done = State.objects.create(name="Done", group="completed", color="#000", project=project, workspace=workspace)
    Issue.objects.create(project=project, workspace=workspace, name="One", state=started, priority="high")
    Issue.objects.create(project=project, workspace=workspace, name="Two", state=started, priority="urgent")
    Issue.objects.create(
        project=project,
        workspace=workspace,
        name="Three",
        state=done,
        priority="none",
        completed_at=timezone.now(),
    )
    return project


@pytest.fixture
def excluded_records(db, workspace, create_user, project_with_issues):
    """Records that must not be counted anywhere: archived/draft/triage issues, activity on them, and a
    soft-deleted membership."""
    project = project_with_issues
    started = State.objects.get(project=project, group="started")
    triage = State.all_objects.create(name="Triage", group="triage", color="#000", project=project, workspace=workspace)
    archived = Issue.objects.create(
        project=project, workspace=workspace, name="Archived", state=started, archived_at=timezone.now()
    )
    draft = Issue.objects.create(project=project, workspace=workspace, name="Draft", state=started, is_draft=True)
    intake = Issue.objects.create(project=project, workspace=workspace, name="Intake", state=triage)
    for issue in (archived, draft, intake):
        IssueActivity.objects.create(issue=issue, project=project, workspace=workspace, actor=create_user)

    former = User.objects.create(email="former@plane.so", username="former")
    WorkspaceMember.objects.create(workspace=workspace, member=former, role=15, deleted_at=timezone.now())
    return {"archived": archived, "draft": draft, "intake": intake, "former_member": former}


@pytest.fixture
def instance(db):
    return Instance.objects.create(
        instance_name="Test instance",
        instance_id="test-instance",
        current_version="1.0.0",
        last_checked_at=timezone.now(),
        is_setup_done=True,
    )


@pytest.mark.contract
class TestWorkspaceObservabilityEndpoint:
    @pytest.mark.django_db
    def test_returns_workspace_metrics(self, session_client, create_user, workspace, project_with_issues):
        session_client.force_authenticate(user=create_user)
        url = reverse("workspace-observability", kwargs={"slug": workspace.slug})

        response = session_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["workspace"]["slug"] == workspace.slug
        assert response.data["totals"]["projects"] == 1
        assert response.data["totals"]["members"] == 1
        assert response.data["totals"]["issues"] == 3
        assert response.data["issues"]["by_state_group"]["started"] == 2
        assert response.data["issues"]["by_state_group"]["completed"] == 1
        assert response.data["issues"]["by_priority"]["high"] == 1
        assert response.data["issues"]["created_last_7_days"] == 3
        assert response.data["issues"]["completed_last_7_days"] == 1
        assert response.data["issues"]["overdue"] == 0
        assert len(response.data["activity"]) == 14

    @pytest.mark.django_db
    def test_excludes_archived_draft_intake_and_deleted(
        self, session_client, create_user, workspace, project_with_issues, excluded_records
    ):
        session_client.force_authenticate(user=create_user)
        url = reverse("workspace-observability", kwargs={"slug": workspace.slug})

        response = session_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["totals"]["issues"] == 3
        assert response.data["totals"]["members"] == 1
        assert response.data["issues"]["by_state_group"]["started"] == 2
        assert sum(point["count"] for point in response.data["activity"]) == 0

    @pytest.mark.django_db
    def test_guest_is_forbidden(self, session_client, workspace):
        guest = User.objects.create(email="guest@plane.so", username="guest")
        WorkspaceMember.objects.create(workspace=workspace, member=guest, role=5)
        session_client.force_authenticate(user=guest)
        url = reverse("workspace-observability", kwargs={"slug": workspace.slug})

        response = session_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    def test_anonymous_is_rejected(self, api_client, workspace):
        url = reverse("workspace-observability", kwargs={"slug": workspace.slug})

        response = api_client.get(url)

        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


@pytest.mark.contract
class TestInstanceObservabilityEndpoint:
    @pytest.mark.django_db
    def test_instance_admin_gets_metrics(self, session_client, create_user, instance, workspace, project_with_issues):
        InstanceAdmin.objects.create(instance=instance, user=create_user, role=20)
        session_client.force_authenticate(user=create_user)

        response = session_client.get(reverse("instance-observability"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["instance"]["instance_id"] == "test-instance"
        assert response.data["totals"]["workspaces"] == 1
        assert response.data["totals"]["issues"] == 3
        assert response.data["issues"]["by_priority"]["urgent"] == 1
        assert response.data["top_workspaces"][0]["slug"] == workspace.slug
        assert response.data["top_workspaces"][0]["issues"] == 3
        assert response.data["top_workspaces"][0]["members"] == 1
        assert len(response.data["activity"]) == 14

    @pytest.mark.django_db
    def test_top_workspaces_and_activity_exclude_ineligible_records(
        self, session_client, create_user, instance, workspace, project_with_issues, excluded_records
    ):
        InstanceAdmin.objects.create(instance=instance, user=create_user, role=20)
        session_client.force_authenticate(user=create_user)

        response = session_client.get(reverse("instance-observability"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["totals"]["issues"] == 3
        assert response.data["top_workspaces"][0]["issues"] == 3
        assert response.data["top_workspaces"][0]["members"] == 1
        assert sum(point["count"] for point in response.data["activity"]) == 0

    @pytest.mark.django_db
    def test_non_admin_is_forbidden(self, session_client, create_user, instance):
        session_client.force_authenticate(user=create_user)

        response = session_client.get(reverse("instance-observability"))

        assert response.status_code == status.HTTP_403_FORBIDDEN
