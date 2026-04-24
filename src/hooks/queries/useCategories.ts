import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../../services/api/categoryApi";
import { qk } from "../../lib/query/keys";
import type { CategoryPayload } from "../../types/category";

export function useCategoryList(params: { search?: string; activeOnly?: boolean; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qk.categories.list(params),
    queryFn: () => categoryApi.list(params),
    placeholderData: (prev) => prev
  });
}

export function useCategoryLookup() {
  return useQuery({
    queryKey: qk.categories.lookup(),
    queryFn: () => categoryApi.lookup(),
    staleTime: 60_000
  });
}

export function useCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.categories.all });
    qc.invalidateQueries({ queryKey: qk.parts.all });
  };
  return {
    create: useMutation({ mutationFn: (p: CategoryPayload) => categoryApi.create(p), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: (v: { id: string; payload: CategoryPayload }) => categoryApi.update(v.id, v.payload),
      onSuccess: invalidate
    }),
    setActive: useMutation({
      mutationFn: (v: { id: string; isActive: boolean }) => categoryApi.setActive(v.id, v.isActive),
      onSuccess: invalidate
    }),
    remove: useMutation({ mutationFn: (id: string) => categoryApi.remove(id), onSuccess: invalidate })
  };
}
