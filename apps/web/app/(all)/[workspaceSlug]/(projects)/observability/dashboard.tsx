/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { TrendingDown, TrendingUp } from "lucide-react";
// plane imports
import { cn } from "@plane/utils";
// local imports
import { MOCK_LOG_EVENTS, MOCK_SERVICES, MOCK_TELEMETRY_METRICS, MOCK_USAGE_METRICS } from "./mock-data";
import type { TLogLevel, TServiceStatus } from "./mock-data";

const STATUS_STYLES: Record<TServiceStatus, { label: string; dot: string; badge: string }> = {
  operational: { label: "Operational", dot: "bg-green-500", badge: "bg-green-500/10 text-green-600" },
  degraded: { label: "Degraded", dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600" },
  down: { label: "Down", dot: "bg-red-500", badge: "bg-red-500/10 text-red-600" },
};

const LEVEL_STYLES: Record<TLogLevel, string> = {
  info: "bg-blue-500/10 text-blue-600",
  warn: "bg-amber-500/10 text-amber-600",
  error: "bg-red-500/10 text-red-600",
};

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const width = 96;
  const height = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("shrink-0 overflow-visible", className)}
      aria-hidden
    >
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

function TrendBadge({ change, invert = false }: { change: number; invert?: boolean }) {
  const isUp = change >= 0;
  const isGood = invert ? !isUp : isUp;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-caption-xs-medium",
        isGood ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
      )}
    >
      <Icon className="size-3" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-0.5">
      <h3 className="text-body-md-semibold text-primary">{title}</h3>
      <p className="text-body-xs-regular text-secondary">{description}</p>
    </div>
  );
}

function ServiceHealthSection() {
  return (
    <section className="space-y-3">
      <SectionHeading title="System health" description="Live status of the services backing this workspace." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_SERVICES.map((service) => {
          const style = STATUS_STYLES[service.status];
          return (
            <div key={service.name} className="space-y-3 rounded-lg border border-subtle bg-surface-1 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-body-sm-medium text-primary">{service.name}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-caption-xs-medium",
                    style.badge
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", style.dot)} />
                  {style.label}
                </span>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-caption-xs-regular">
                <div>
                  <dt className="text-tertiary">Uptime</dt>
                  <dd className="text-body-xs-medium text-primary">{service.uptime}</dd>
                </div>
                <div>
                  <dt className="text-tertiary">Version</dt>
                  <dd className="text-body-xs-medium text-primary">{service.version}</dd>
                </div>
                <div>
                  <dt className="text-tertiary">Latency</dt>
                  <dd className="text-body-xs-medium text-primary">{service.latencyMs} ms</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function UsageMetricsSection() {
  return (
    <section className="space-y-3">
      <SectionHeading title="Usage" description="Activity in this workspace over the last 30 days." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_USAGE_METRICS.map((metric) => (
          <div key={metric.label} className="space-y-2 rounded-lg border border-subtle bg-surface-1 p-4">
            <p className="text-body-xs-regular text-secondary">{metric.label}</p>
            <div className="flex items-end justify-between gap-2">
              <span className="text-h5-semibold text-primary">{metric.value}</span>
              <Sparkline data={metric.sparkline} className="text-accent-primary" />
            </div>
            <TrendBadge change={metric.change} />
          </div>
        ))}
      </div>
    </section>
  );
}

function TelemetrySection() {
  return (
    <section className="space-y-3">
      <SectionHeading title="Telemetry" description="Request throughput, reliability and latency over the last hour." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_TELEMETRY_METRICS.map((metric) => {
          const lowerIsBetter = metric.label !== "Request rate";
          return (
            <div key={metric.label} className="space-y-2 rounded-lg border border-subtle bg-surface-1 p-4">
              <p className="text-body-xs-regular text-secondary">{metric.label}</p>
              <div className="flex items-end justify-between gap-2">
                <span className="text-h5-semibold text-primary">
                  {metric.value} <span className="text-body-xs-regular text-tertiary">{metric.unit}</span>
                </span>
                <Sparkline data={metric.sparkline} className="text-accent-primary" />
              </div>
              <TrendBadge change={metric.change} invert={lowerIsBetter} />
            </div>
          );
        })}
      </div>
      <div className="overflow-hidden rounded-lg border border-subtle bg-surface-1">
        <div className="flex items-center justify-between border-b border-subtle px-4 py-2.5">
          <span className="text-body-sm-medium text-primary">Recent events</span>
          <span className="text-caption-xs-regular text-tertiary">Showing last {MOCK_LOG_EVENTS.length}</span>
        </div>
        <table className="w-full text-left text-body-xs-regular">
          <thead className="text-caption-xs-medium text-tertiary">
            <tr className="border-b border-subtle">
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Level</th>
              <th className="px-4 py-2 font-medium">Service</th>
              <th className="px-4 py-2 font-medium">Message</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LOG_EVENTS.map((event) => (
              <tr key={event.id} className="border-b border-subtle last:border-b-0">
                <td className="font-mono px-4 py-2 whitespace-nowrap text-tertiary">{event.timestamp}</td>
                <td className="px-4 py-2">
                  <span
                    className={cn(
                      "rounded-sm px-1.5 py-0.5 text-caption-xs-medium uppercase",
                      LEVEL_STYLES[event.level]
                    )}
                  >
                    {event.level}
                  </span>
                </td>
                <td className="font-mono px-4 py-2 text-secondary">{event.service}</td>
                <td className="px-4 py-2 text-primary">{event.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ObservabilityDashboard() {
  return (
    <div className="space-y-8">
      <ServiceHealthSection />
      <UsageMetricsSection />
      <TelemetrySection />
    </div>
  );
}
