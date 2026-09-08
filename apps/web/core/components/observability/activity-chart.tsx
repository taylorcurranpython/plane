/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useTranslation } from "@plane/i18n";
import type { TObservabilityActivityPoint } from "@plane/types";

type TActivityChartProps = {
  title: string;
  points: TObservabilityActivityPoint[];
};

const formatDay = (isoDate: string) => {
  const [, month, day] = isoDate.split("-");
  return `${month}/${day}`;
};

export function ActivityChart(props: TActivityChartProps) {
  const { title, points } = props;
  const { t } = useTranslation();
  const max = Math.max(1, ...points.map((point) => point.count));
  const total = points.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-subtle bg-layer-1 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="text-body-sm-medium text-primary">{title}</div>
        <div className="text-caption-sm-regular text-tertiary tabular-nums">
          {t("workspace_observability.activity_summary", { count: total.toLocaleString(), days: points.length })}
        </div>
      </div>
      <div className="flex h-32 items-end gap-1" role="img" aria-label={title}>
        {points.map((point) => (
          <div key={point.date} className="group flex h-full flex-1 flex-col justify-end">
            <div
              title={`${point.date}: ${point.count}`}
              className="w-full rounded-t-sm bg-accent-primary/70 transition-colors group-hover:bg-accent-primary"
              style={{ height: point.count === 0 ? 0 : `${Math.max(2, (point.count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-caption-sm-regular text-tertiary">
        <span>{points[0] ? formatDay(points[0].date) : ""}</span>
        <span>{points[points.length - 1] ? formatDay(points[points.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}
