/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TObservabilityStateGroup = "backlog" | "unstarted" | "started" | "completed" | "cancelled";

export type TObservabilityPriority = "urgent" | "high" | "medium" | "low" | "none";

export type TObservabilityActivityPoint = {
  date: string;
  count: number;
};

export type TObservabilityIssueBreakdown = {
  by_state_group: Record<TObservabilityStateGroup, number>;
  by_priority: Record<TObservabilityPriority, number>;
  created_last_7_days: number;
  completed_last_7_days: number;
};

export type TWorkspaceObservability = {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  totals: {
    projects: number;
    members: number;
    issues: number;
    cycles: number;
    modules: number;
    pages: number;
  };
  issues: TObservabilityIssueBreakdown & {
    overdue: number;
  };
  activity: TObservabilityActivityPoint[];
  generated_at: string;
};

export type TInstanceObservability = {
  instance: {
    instance_id: string;
    instance_name: string;
    current_version: string;
    latest_version: string | null;
    edition: string;
    is_telemetry_enabled: boolean;
    is_verified: boolean;
    is_setup_done: boolean;
    last_checked_at: string;
  };
  totals: {
    users: number;
    active_users_last_7_days: number;
    workspaces: number;
    projects: number;
    issues: number;
    cycles: number;
    modules: number;
    pages: number;
  };
  issues: TObservabilityIssueBreakdown;
  top_workspaces: {
    id: string;
    name: string;
    slug: string;
    issues: number;
    members: number;
  }[];
  activity: TObservabilityActivityPoint[];
  generated_at: string;
};
