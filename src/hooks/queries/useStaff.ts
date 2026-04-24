import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "../../services/api/staffApi";
import { qk } from "../../lib/query/keys";
import type { CreateStaffPayload, UpdateStaffPayload } from "../../types/staff";

export function useStaffList(params: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qk.staff.list(params),
    queryFn: () => staffApi.list(params),
    placeholderData: (prev) => prev
  });
}

export function useStaff(id: string | undefined) {
  return useQuery({
    queryKey: qk.staff.detail(id ?? ""),
    queryFn: () => staffApi.get(id!),
    enabled: !!id
  });
}

export function useStaffMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.staff.all });
  return {
    create: useMutation({ mutationFn: (p: CreateStaffPayload) => staffApi.create(p), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: (v: { id: string; payload: UpdateStaffPayload }) => staffApi.update(v.id, v.payload),
      onSuccess: invalidate
    }),
    setActive: useMutation({
      mutationFn: (v: { id: string; isActive: boolean }) => staffApi.setActive(v.id, v.isActive),
      onSuccess: invalidate
    }),
    remove: useMutation({ mutationFn: (id: string) => staffApi.remove(id), onSuccess: invalidate })
  };
}
