import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { PagedResult } from "../../types/common";
import type { CreateStaffPayload, Staff, UpdateStaffPayload } from "../../types/staff";

export const staffApi = {
  list: (params: { search?: string; page?: number; pageSize?: number }) =>
    api.get<ApiResult<PagedResult<Staff>>>("/admin/staff", { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResult<Staff>>(`/admin/staff/${id}`).then((r) => r.data),

  create: (payload: CreateStaffPayload) =>
    api.post<ApiResult<Staff>>("/admin/staff", payload).then((r) => r.data),

  update: (id: string, payload: UpdateStaffPayload) =>
    api.put<ApiResult<Staff>>(`/admin/staff/${id}`, payload).then((r) => r.data),

  setActive: (id: string, isActive: boolean) =>
    api.patch<ApiResult<null>>(`/admin/staff/${id}/active`, { isActive }).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResult<null>>(`/admin/staff/${id}`).then((r) => r.data)
};
