/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ReactNode } from "react";
import { cn } from "@plane/utils";

type TStatCardProps = {
  label: string;
  value: number | string;
  hint?: ReactNode;
  className?: string;
};

export function StatCard(props: TStatCardProps) {
  const { label, value, hint, className } = props;
  return (
    <div className={cn("flex flex-col gap-1 rounded-md border border-subtle bg-layer-1 px-4 py-3", className)}>
      <div className="text-caption-sm-regular tracking-wide text-tertiary uppercase">{label}</div>
      <div className="text-h4-semibold text-primary tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {hint && <div className="text-caption-sm-regular text-secondary">{hint}</div>}
    </div>
  );
}
