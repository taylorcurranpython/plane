/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { STATE_GROUPS } from "@plane/constants";
import type { TObservabilityIssueBreakdown, TObservabilityPriority, TObservabilityStateGroup } from "@plane/types";
import type { TBreakdownSegment } from "./breakdown-bar";

export const OBSERVABILITY_STATE_GROUPS: TObservabilityStateGroup[] = [
  "backlog",
  "unstarted",
  "started",
  "completed",
  "cancelled",
];

export const OBSERVABILITY_PRIORITIES: { key: TObservabilityPriority; label: string; color: string }[] = [
  { key: "urgent", label: "Urgent", color: "#dc2626" },
  { key: "high", label: "High", color: "#f97316" },
  { key: "medium", label: "Medium", color: "#f59e0b" },
  { key: "low", label: "Low", color: "#3f76ff" },
  { key: "none", label: "None", color: "#a3a3a3" },
];

export const toStateGroupSegments = (breakdown: TObservabilityIssueBreakdown): TBreakdownSegment[] =>
  OBSERVABILITY_STATE_GROUPS.map((group) => ({
    key: group,
    label: STATE_GROUPS[group].label,
    value: breakdown.by_state_group[group] ?? 0,
    color: STATE_GROUPS[group].color,
  }));

export const toPrioritySegments = (breakdown: TObservabilityIssueBreakdown): TBreakdownSegment[] =>
  OBSERVABILITY_PRIORITIES.map((priority) => ({
    key: priority.key,
    label: priority.label,
    value: breakdown.by_priority[priority.key] ?? 0,
    color: priority.color,
  }));
