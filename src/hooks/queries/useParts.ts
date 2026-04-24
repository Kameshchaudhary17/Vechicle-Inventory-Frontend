import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partApi } from "../../services/api/partApi";
import { qk } from "../../lib/query/keys";
import type { PartPayload } from "../../types/part";

export function usePartList(params: {
  search?: string; categoryId?: string; lowStockOnly?: boolean;
  activeOnly?: boolean; page?: number; pageSize?: number;
}) {
  return useQuery({
    queryKey: qk.parts.list(params),
    queryFn: () => partApi.list(params),
    placeholderData: (prev) => prev
  });
}

export function useStaffPartList(params: {
  search?: string; categoryId?: string; activeOnly?: boolean; page?: number; pageSize?: number;
}) {
  return useQuery({
    queryKey: ["staff-parts", "list", params],
    queryFn: () => partApi.staffList(params),
    placeholderData: (prev) => prev
  });
}

export function usePartStats(opts?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: qk.parts.stats(),
    queryFn: () => partApi.stats(),
    refetchInterval: opts?.refetchIntervalMs ?? 10_000
  });
}

export function usePart(id: string | undefined) {
  return useQuery({
    queryKey: qk.parts.detail(id ?? ""),
    queryFn: () => partApi.get(id!),
    enabled: !!id
  });
}

export function usePartMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.parts.all });
  return {
    create: useMutation({ mutationFn: (p: PartPayload) => partApi.create(p), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: (v: { id: string; payload: PartPayload }) => partApi.update(v.id, v.payload),
      onSuccess: invalidate
    }),
    setActive: useMutation({
      mutationFn: (v: { id: string; isActive: boolean }) => partApi.setActive(v.id, v.isActive),
      onSuccess: invalidate
    }),
    remove: useMutation({ mutationFn: (id: string) => partApi.remove(id), onSuccess: invalidate })
  };
}
