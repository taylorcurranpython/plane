/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TServiceStatus = "operational" | "degraded" | "down";

export type TServiceHealth = {
  name: string;
  status: TServiceStatus;
  uptime: string;
  version: string;
  latencyMs: number;
};

export type TUsageMetric = {
  label: string;
  value: string;
  change: number;
  sparkline: number[];
};

export type TTelemetryMetric = {
  label: string;
  value: string;
  unit: string;
  change: number;
  sparkline: number[];
};

export type TLogLevel = "info" | "warn" | "error";

export type TLogEvent = {
  id: string;
  timestamp: string;
  level: TLogLevel;
  service: string;
  message: string;
};

export const MOCK_SERVICES: TServiceHealth[] = [
  { name: "API", status: "operational", uptime: "99.98%", version: "v1.2.4", latencyMs: 82 },
  { name: "PostgreSQL", status: "operational", uptime: "99.99%", version: "15.4", latencyMs: 4 },
  { name: "Redis / Valkey", status: "operational", uptime: "100%", version: "7.2", latencyMs: 1 },
  { name: "RabbitMQ", status: "degraded", uptime: "99.71%", version: "3.13", latencyMs: 210 },
  { name: "Celery workers", status: "operational", uptime: "99.95%", version: "v1.2.4", latencyMs: 0 },
  { name: "Live (Hocuspocus)", status: "operational", uptime: "99.92%", version: "v1.2.4", latencyMs: 37 },
];

export const MOCK_USAGE_METRICS: TUsageMetric[] = [
  { label: "Active users (30d)", value: "1,284", change: 6.2, sparkline: [62, 68, 71, 70, 78, 84, 91] },
  { label: "Workspaces", value: "37", change: 2.8, sparkline: [30, 31, 31, 33, 34, 36, 37] },
  { label: "Projects", value: "412", change: 4.1, sparkline: [360, 372, 380, 391, 398, 405, 412] },
  { label: "Work items", value: "58,930", change: 9.7, sparkline: [41, 44, 47, 49, 52, 55, 59] },
];

export const MOCK_TELEMETRY_METRICS: TTelemetryMetric[] = [
  { label: "Request rate", value: "342", unit: "req/s", change: 3.4, sparkline: [280, 310, 295, 330, 350, 338, 342] },
  { label: "Error rate", value: "0.42", unit: "%", change: -0.8, sparkline: [0.9, 0.7, 0.8, 0.6, 0.5, 0.45, 0.42] },
  { label: "p95 latency", value: "184", unit: "ms", change: -5.1, sparkline: [240, 228, 215, 205, 198, 190, 184] },
  { label: "Queue depth", value: "126", unit: "jobs", change: 12.5, sparkline: [60, 72, 80, 95, 104, 118, 126] },
];

export const MOCK_LOG_EVENTS: TLogEvent[] = [
  {
    id: "evt-001",
    timestamp: "2026-09-08 01:32:14",
    level: "warn",
    service: "rabbitmq",
    message: "Consumer lag above threshold on queue `notifications` (1.8s).",
  },
  {
    id: "evt-002",
    timestamp: "2026-09-08 01:29:51",
    level: "info",
    service: "api",
    message: "Scheduled job `archive_old_pages` completed in 3.2s (412 rows).",
  },
  {
    id: "evt-003",
    timestamp: "2026-09-08 01:24:08",
    level: "error",
    service: "worker",
    message: "SMTP delivery failed for 2 messages: connection timed out after 30s.",
  },
  {
    id: "evt-004",
    timestamp: "2026-09-08 01:15:37",
    level: "info",
    service: "live",
    message: "Reconnected 14 collaborative sessions after transient websocket drop.",
  },
  {
    id: "evt-005",
    timestamp: "2026-09-08 00:58:22",
    level: "info",
    service: "postgres",
    message: "Autovacuum finished on `issues_issue` (dead tuples: 12,480).",
  },
  {
    id: "evt-006",
    timestamp: "2026-09-08 00:41:05",
    level: "warn",
    service: "api",
    message: "Rate limit reached for 3 API keys (429 responses: 57).",
  },
];
