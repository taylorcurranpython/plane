/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// components
import { PageWrapper } from "@/components/common/page-wrapper";
// local imports
import { ObservabilityDashboard } from "./dashboard";
// types
import type { Route } from "./+types/page";

function ObservabilityPage() {
  return (
    <PageWrapper
      header={{
        title: "Observability",
        description: "Monitor the health, usage and telemetry of your instance. Data shown is sample data.",
      }}
    >
      <ObservabilityDashboard />
    </PageWrapper>
  );
}

export const meta: Route.MetaFunction = () => [{ title: "Observability - God Mode" }];

export default observer(ObservabilityPage);
