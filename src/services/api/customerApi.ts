import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { PagedResult } from "../../types/common";
import type {
  Customer, CustomerListItem, CustomerStats,
  CreateCustomerPayload, UpdateCustomerPayload,
  Vehicle, VehicleUpsertPayload
} from "../../types/customer";

export const customerApi = {
  list: (params: {
    search?: string; vehicleNumber?: string; phone?: string;
    activeOnly?: boolean; page?: number; pageSize?: number;
  }) =>
    api.get<ApiResult<PagedResult<CustomerListItem>>>("/customers", { params }).then((r) => r.data),

  stats: () =>
    api.get<ApiResult<CustomerStats>>("/customers/stats").then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResult<Customer>>(`/customers/${id}`).then((r) => r.data),

  create: (payload: CreateCustomerPayload) =>
    api.post<ApiResult<Customer>>("/customers", payload).then((r) => r.data),

  update: (id: string, payload: UpdateCustomerPayload) =>
    api.put<ApiResult<Customer>>(`/customers/${id}`, payload).then((r) => r.data),

  setActive: (id: string, isActive: boolean) =>
    api.patch<ApiResult<null>>(`/customers/${id}/active`, { isActive }).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResult<null>>(`/customers/${id}`).then((r) => r.data),

  listVehicles: (id: string) =>
    api.get<ApiResult<Vehicle[]>>(`/customers/${id}/vehicles`).then((r) => r.data),

  addVehicle: (id: string, payload: VehicleUpsertPayload) =>
    api.post<ApiResult<Vehicle>>(`/customers/${id}/vehicles`, payload).then((r) => r.data),

  updateVehicle: (id: string, vehicleId: string, payload: VehicleUpsertPayload) =>
    api.put<ApiResult<Vehicle>>(`/customers/${id}/vehicles/${vehicleId}`, payload).then((r) => r.data),

  removeVehicle: (id: string, vehicleId: string) =>
    api.delete<ApiResult<null>>(`/customers/${id}/vehicles/${vehicleId}`).then((r) => r.data)
};
