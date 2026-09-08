/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { Button } from "@makeplane/propel/components/button";
import { ObservabilityService } from "@plane/services";
import { renderFormattedDate } from "@plane/utils";
// components
import { PageWrapper } from "@/components/common/page-wrapper";
import { Skeleton } from "@/components/common/skeleton";
import {
  ActivityChart,
  BreakdownBar,
  StatCard,
  toPrioritySegments,
  toStateGroupSegments,
} from "@/components/observability";
// types
import type { Route } from "./+types/page";

const observabilityService = new ObservabilityService();

const InstanceObservabilityPage = observer(function InstanceObservabilityPage(_props: Route.ComponentProps) {
  const { data, error, isValidating, mutate } = useSWR(
    "INSTANCE_OBSERVABILITY",
    () => observabilityService.instance(),
    { revalidateOnFocus: false }
  );

  const stateSegments = useMemo(() => (data ? toStateGroupSegments(data.issues) : []), [data]);
  const prioritySegments = useMemo(() => (data ? toPrioritySegments(data.issues) : []), [data]);

  return (
    <PageWrapper
      header={{
        title: "Observability",
        description: "Usage, health, and activity across every workspace on this instance.",
        actions: (
          <Button
            variant="secondary"
            size="sm"
            stretch="auto"
            onClick={() => mutate()}
            loading={isValidating}
            label="Refresh"
          />
        ),
      }}
    >
      {error ? (
        <div className="rounded-md border border-danger-strong bg-danger-subtle px-4 py-3 text-body-sm-regular text-danger-primary">
          Could not load instance metrics. {error?.error ?? ""}
        </div>
      ) : data ? (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-body-sm-medium text-primary">Instance</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label="Version"
                value={data.instance.current_version}
                hint={`Edition: ${data.instance.edition}`}
              />
              <StatCard
                label="Telemetry"
                value={data.instance.is_telemetry_enabled ? "On" : "Off"}
                hint={data.instance.is_telemetry_enabled ? "Metrics are exported via OTLP" : "No metrics are exported"}
              />
              <StatCard
                label="Latest version"
                value={data.instance.latest_version ?? "—"}
                hint={`Checked ${renderFormattedDate(data.instance.last_checked_at) ?? "—"}`}
              />
              <StatCard label="Verified" value={data.instance.is_verified ? "Yes" : "No"} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-body-sm-medium text-primary">Totals</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label="Users"
                value={data.totals.users}
                hint={`${data.totals.active_users_last_7_days.toLocaleString()} active in the last 7 days`}
              />
              <StatCard label="Workspaces" value={data.totals.workspaces} />
              <StatCard label="Projects" value={data.totals.projects} />
              <StatCard
                label="Work items"
                value={data.totals.issues}
                hint={`+${data.issues.created_last_7_days.toLocaleString()} created · ${data.issues.completed_last_7_days.toLocaleString()} completed (7d)`}
              />
              <StatCard label="Cycles" value={data.totals.cycles} />
              <StatCard label="Modules" value={data.totals.modules} />
              <StatCard label="Pages" value={data.totals.pages} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <BreakdownBar title="Work items by state" segments={stateSegments} />
            <BreakdownBar title="Work items by priority" segments={prioritySegments} />
          </section>

          <ActivityChart title="Work item activity" points={data.activity} />

          <section className="space-y-3">
            <h2 className="text-body-sm-medium text-primary">Most active workspaces</h2>
            <div className="overflow-hidden rounded-md border border-subtle bg-layer-1">
              <table className="w-full text-body-sm-regular">
                <thead className="bg-layer-2 text-caption-sm-regular text-tertiary">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Workspace</th>
                    <th className="px-4 py-2 text-right font-medium">Members</th>
                    <th className="px-4 py-2 text-right font-medium">Work items</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_workspaces.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-tertiary">
                        No workspaces yet.
                      </td>
                    </tr>
                  ) : (
                    data.top_workspaces.map((workspace) => (
                      <tr key={workspace.id} className="border-t border-subtle">
                        <td className="px-4 py-2 text-primary">
                          <div className="font-medium">{workspace.name}</div>
                          <div className="text-caption-sm-regular text-tertiary">/{workspace.slug}</div>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">{workspace.members.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{workspace.issues.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-caption-sm-regular text-tertiary">
            Generated {renderFormattedDate(data.generated_at) ?? ""} · counts exclude archived, draft, and intake work
            items.
          </p>
        </div>
      ) : (
        <Skeleton className="space-y-6">
          <Skeleton.Item height="80px" width="100%" />
          <Skeleton.Item height="80px" width="100%" />
          <Skeleton.Item height="160px" width="100%" />
        </Skeleton>
      )}
    </PageWrapper>
  );
});

export const meta: Route.MetaFunction = () => [{ title: "Observability - God Mode" }];

export default InstanceObservabilityPage;
