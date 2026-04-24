import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { Customer, UpdateCustomerPayload, Vehicle, VehicleUpsertPayload } from "../../types/customer";

export const customerSelfApi = {
  profile: () =>
    api.get<ApiResult<Customer>>("/customer/me").then((r) => r.data),
  updateProfile: (payload: UpdateCustomerPayload) =>
    api.put<ApiResult<Customer>>("/customer/me", payload).then((r) => r.data),
  listVehicles: () =>
    api.get<ApiResult<Vehicle[]>>("/customer/me/vehicles").then((r) => r.data),
  addVehicle: (payload: VehicleUpsertPayload) =>
    api.post<ApiResult<Vehicle>>("/customer/me/vehicles", payload).then((r) => r.data),
  updateVehicle: (id: string, payload: VehicleUpsertPayload) =>
    api.put<ApiResult<Vehicle>>(`/customer/me/vehicles/${id}`, payload).then((r) => r.data),
  removeVehicle: (id: string) =>
    api.delete<ApiResult<null>>(`/customer/me/vehicles/${id}`).then((r) => r.data)
};
