/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TBreakdownSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type TBreakdownBarProps = {
  title: string;
  segments: TBreakdownSegment[];
};

export function BreakdownBar(props: TBreakdownBarProps) {
  const { title, segments } = props;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-subtle bg-layer-1 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="text-body-sm-medium text-primary">{title}</div>
        <div className="text-caption-sm-regular text-tertiary tabular-nums">{total.toLocaleString()} total</div>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-layer-3" role="img" aria-label={title}>
        {total > 0 &&
          segments
            .filter((segment) => segment.value > 0)
            .map((segment) => (
              <div
                key={segment.key}
                title={`${segment.label}: ${segment.value}`}
                className="h-full"
                style={{ width: `${(segment.value / total) * 100}%`, backgroundColor: segment.color }}
              />
            ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2 text-caption-sm-regular text-secondary">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="truncate">{segment.label}</span>
            <span className="ml-auto text-primary tabular-nums">{segment.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
