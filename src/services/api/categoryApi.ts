import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { PagedResult } from "../../types/common";
import type { Category, CategoryLookup, CategoryPayload } from "../../types/category";

export const categoryApi = {
  list: (params: { search?: string; activeOnly?: boolean; page?: number; pageSize?: number }) =>
    api.get<ApiResult<PagedResult<Category>>>("/admin/categories", { params }).then((r) => r.data),

  lookup: () =>
    api.get<ApiResult<CategoryLookup[]>>("/admin/categories/lookup").then((r) => r.data),

  create: (payload: CategoryPayload) =>
    api.post<ApiResult<Category>>("/admin/categories", payload).then((r) => r.data),

  update: (id: string, payload: CategoryPayload) =>
    api.put<ApiResult<Category>>(`/admin/categories/${id}`, payload).then((r) => r.data),

  setActive: (id: string, isActive: boolean) =>
    api.patch<ApiResult<null>>(`/admin/categories/${id}/active`, { isActive }).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResult<null>>(`/admin/categories/${id}`).then((r) => r.data)
};
