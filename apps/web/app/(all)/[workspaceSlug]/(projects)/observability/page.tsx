/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// components
import { PageHead } from "@/components/core/page-title";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// local imports
import { ObservabilityDashboard } from "./dashboard";

function WorkspaceObservabilityPage() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - ${t("observability")}` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="h-full w-full overflow-y-auto px-6 py-6">
        <ObservabilityDashboard />
      </div>
    </>
  );
}

export default observer(WorkspaceObservabilityPage);
