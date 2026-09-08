/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { ObservabilityService } from "@plane/services";
import { Loader } from "@plane/ui";
import { renderFormattedDate } from "@plane/utils";
// components
import { PageHead } from "@/components/core/page-title";
import {
  ActivityChart,
  BreakdownBar,
  StatCard,
  toPrioritySegments,
  toStateGroupSegments,
} from "@/components/observability";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// types
import type { Route } from "./+types/page";

const observabilityService = new ObservabilityService();

function WorkspaceObservabilityPage({ params }: Route.ComponentProps) {
  const { workspaceSlug } = params;
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();

  const { data, error, isValidating, mutate } = useSWR(
    workspaceSlug ? `WORKSPACE_OBSERVABILITY_${workspaceSlug}` : null,
    workspaceSlug ? () => observabilityService.workspace(workspaceSlug) : null,
    { revalidateOnFocus: false }
  );

  const stateSegments = useMemo(() => (data ? toStateGroupSegments(data.issues) : []), [data]);
  const prioritySegments = useMemo(() => (data ? toPrioritySegments(data.issues) : []), [data]);

  const pageTitle = currentWorkspace?.name
    ? t("workspace_observability.page_label", { workspace: currentWorkspace.name })
    : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="vertical-scrollbar scrollbar-md h-full w-full overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-h5-semibold text-primary">{t("workspace_observability.label")}</h1>
              <p className="text-body-sm-regular text-secondary">{t("workspace_observability.description")}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => mutate()} loading={isValidating}>
              {t("workspace_observability.refresh")}
            </Button>
          </div>

          {error ? (
            <div className="rounded-md border border-danger-strong bg-danger-subtle px-4 py-3 text-body-sm-regular text-danger-primary">
              {t("workspace_observability.error")}
            </div>
          ) : data ? (
            <>
              <section className="space-y-3">
                <h2 className="text-body-sm-medium text-primary">{t("workspace_observability.totals")}</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatCard label={t("workspace_observability.projects")} value={data.totals.projects} />
                  <StatCard label={t("workspace_observability.members")} value={data.totals.members} />
                  <StatCard
                    label={t("workspace_observability.work_items")}
                    value={data.totals.issues}
                    hint={`+${data.issues.created_last_7_days.toLocaleString()} ${t("workspace_observability.created_last_7_days").toLowerCase()} · ${data.issues.completed_last_7_days.toLocaleString()} ${t("workspace_observability.completed_last_7_days").toLowerCase()}`}
                  />
                  <StatCard
                    label={t("workspace_observability.overdue")}
                    value={data.issues.overdue}
                    hint={t("workspace_observability.overdue_hint")}
                  />
                  <StatCard label={t("workspace_observability.cycles")} value={data.totals.cycles} />
                  <StatCard label={t("workspace_observability.modules")} value={data.totals.modules} />
                  <StatCard label={t("workspace_observability.pages")} value={data.totals.pages} />
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <BreakdownBar title={t("workspace_observability.by_state")} segments={stateSegments} />
                <BreakdownBar title={t("workspace_observability.by_priority")} segments={prioritySegments} />
              </section>

              <ActivityChart title={t("workspace_observability.activity")} points={data.activity} />

              <p className="text-caption-sm-regular text-tertiary">
                {t("workspace_observability.footer", { date: renderFormattedDate(data.generated_at) ?? "" })}
              </p>
            </>
          ) : (
            <Loader className="space-y-6">
              <Loader.Item height="80px" width="100%" />
              <Loader.Item height="80px" width="100%" />
              <Loader.Item height="160px" width="100%" />
            </Loader>
          )}
        </div>
      </div>
    </>
  );
}

export default observer(WorkspaceObservabilityPage);
