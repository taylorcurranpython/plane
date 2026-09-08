/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { screen, waitFor } from "@testing-library/react";
import { observer } from "mobx-react";
import { describe, expect, it, vi } from "vitest";
import type { IInstance, IInstanceConfig } from "@plane/types";
import { useInstance } from "@/hooks/store/use-instance";
import type { InstanceStore } from "@/store/instance.store";
import { createTestStore, renderWithProviders } from "../test-utils";

const InstanceName = observer(function InstanceName() {
  const { instance, isLoading, error } = useInstance();
  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>Loading</p>;
  return <p>{instance?.instance_name}</p>;
});

describe("space InstanceStore", () => {
  it("hydrates instance data", () => {
    const store = createTestStore();
    store.instance.hydrate({ instance_name: "Acme" } as IInstance);
    expect(store.instance.instance?.instance_name).toBe("Acme");
  });

  it("stores the fetched instance and config", async () => {
    const store = createTestStore();
    vi.spyOn((store.instance as InstanceStore).instanceService, "info").mockResolvedValue({
      instance: { instance_name: "Acme" } as IInstance,
      config: { is_smtp_configured: true } as IInstanceConfig,
    });

    renderWithProviders(<InstanceName />, { store });
    expect(screen.getByText("Loading")).toBeInTheDocument();

    await store.instance.fetchInstanceInfo();
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());
    expect(store.instance.config?.is_smtp_configured).toBe(true);
  });

  it("surfaces a friendly error when the request fails", async () => {
    const store = createTestStore();
    vi.spyOn((store.instance as InstanceStore).instanceService, "info").mockRejectedValue(new Error("boom"));

    renderWithProviders(<InstanceName />, { store });
    await store.instance.fetchInstanceInfo();

    expect(store.instance.isLoading).toBe(false);
    await waitFor(() => expect(screen.getByText("Failed to fetch instance info")).toBeInTheDocument());
  });
});
