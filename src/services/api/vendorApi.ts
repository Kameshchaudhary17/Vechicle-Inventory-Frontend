import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { PagedResult } from "../../types/common";
import type { Vendor, VendorPayload, VendorStats } from "../../types/vendor";

export const vendorApi = {
  list: (params: { search?: string; activeOnly?: boolean; page?: number; pageSize?: number }) =>
    api.get<ApiResult<PagedResult<Vendor>>>("/admin/vendors", { params }).then((r) => r.data),

  stats: () =>
    api.get<ApiResult<VendorStats>>("/admin/vendors/stats").then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResult<Vendor>>(`/admin/vendors/${id}`).then((r) => r.data),

  create: (payload: VendorPayload) =>
    api.post<ApiResult<Vendor>>("/admin/vendors", payload).then((r) => r.data),

  update: (id: string, payload: VendorPayload) =>
    api.put<ApiResult<Vendor>>(`/admin/vendors/${id}`, payload).then((r) => r.data),

  setActive: (id: string, isActive: boolean) =>
    api.patch<ApiResult<null>>(`/admin/vendors/${id}/active`, { isActive }).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResult<null>>(`/admin/vendors/${id}`).then((r) => r.data)
};
