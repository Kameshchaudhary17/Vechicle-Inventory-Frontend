import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "../../services/api/vendorApi";
import { qk } from "../../lib/query/keys";
import type { VendorPayload } from "../../types/vendor";

export function useVendorList(params: { search?: string; activeOnly?: boolean; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qk.vendors.list(params),
    queryFn: () => vendorApi.list(params),
    placeholderData: (prev) => prev
  });
}

export function useVendorStats(opts?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: qk.vendors.stats(),
    queryFn: () => vendorApi.stats(),
    refetchInterval: opts?.refetchIntervalMs ?? 15_000
  });
}

export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: qk.vendors.detail(id ?? ""),
    queryFn: () => vendorApi.get(id!),
    enabled: !!id
  });
}

export function useVendorMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.vendors.all });

  return {
    create: useMutation({ mutationFn: (p: VendorPayload) => vendorApi.create(p), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: (v: { id: string; payload: VendorPayload }) => vendorApi.update(v.id, v.payload),
      onSuccess: invalidate
    }),
    setActive: useMutation({
      mutationFn: (v: { id: string; isActive: boolean }) => vendorApi.setActive(v.id, v.isActive),
      onSuccess: invalidate
    }),
    remove: useMutation({ mutationFn: (id: string) => vendorApi.remove(id), onSuccess: invalidate })
  };
}
