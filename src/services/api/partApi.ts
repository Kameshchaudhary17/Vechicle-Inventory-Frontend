import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { PagedResult } from "../../types/common";
import type { Part, PartPayload, PartStats } from "../../types/part";

export const partApi = {
  list: (params: {
    search?: string; categoryId?: string;
    lowStockOnly?: boolean; activeOnly?: boolean;
    page?: number; pageSize?: number;
  }) =>
    api.get<ApiResult<PagedResult<Part>>>("/admin/parts", { params }).then((r) => r.data),

  stats: () =>
    api.get<ApiResult<PartStats>>("/admin/parts/stats").then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResult<Part>>(`/admin/parts/${id}`).then((r) => r.data),

  create: (payload: PartPayload) =>
    api.post<ApiResult<Part>>("/admin/parts", payload).then((r) => r.data),

  update: (id: string, payload: PartPayload) =>
    api.put<ApiResult<Part>>(`/admin/parts/${id}`, payload).then((r) => r.data),

  setActive: (id: string, isActive: boolean) =>
    api.patch<ApiResult<null>>(`/admin/parts/${id}/active`, { isActive }).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResult<null>>(`/admin/parts/${id}`).then((r) => r.data),

  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResult<string>>(`/admin/parts/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    }).then((r) => r.data);
  },

  deleteImage: (id: string) =>
    api.delete<ApiResult<null>>(`/admin/parts/${id}/image`).then((r) => r.data),

  staffList: (params: { search?: string; categoryId?: string; activeOnly?: boolean; lowStockOnly?: boolean; page?: number; pageSize?: number }) =>
    api.get<ApiResult<PagedResult<Part>>>("/staff/parts", { params }).then((r) => r.data),

  staffStats: () =>
    api.get<ApiResult<PartStats>>("/staff/parts/stats").then((r) => r.data)
};
