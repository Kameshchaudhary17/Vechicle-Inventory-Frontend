import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { PagedResult } from "../../types/common";
import type {
  Appointment, AppointmentStatus, CreateAppointmentPayload,
  PartRequest, PartRequestStatus, CreatePartRequestPayload, ReplyPartRequestPayload,
  ServiceReview, CreateReviewPayload
} from "../../types/engagement";

export const engagementApi = {
  appointments: {
    list: (params: { customerId?: string; status?: AppointmentStatus; page?: number; pageSize?: number }) =>
      api.get<ApiResult<PagedResult<Appointment>>>("/appointments", { params }).then((r) => r.data),
    create: (payload: CreateAppointmentPayload) =>
      api.post<ApiResult<Appointment>>("/appointments", payload).then((r) => r.data),
    setStatus: (id: string, status: AppointmentStatus) =>
      api.patch<ApiResult<null>>(`/appointments/${id}/status`, { status }).then((r) => r.data)
  },
  partRequests: {
    list: (params: { customerId?: string; status?: PartRequestStatus; page?: number; pageSize?: number }) =>
      api.get<ApiResult<PagedResult<PartRequest>>>("/part-requests", { params }).then((r) => r.data),
    create: (payload: CreatePartRequestPayload) =>
      api.post<ApiResult<PartRequest>>("/part-requests", payload).then((r) => r.data),
    reply: (id: string, payload: ReplyPartRequestPayload) =>
      api.patch<ApiResult<null>>(`/part-requests/${id}/reply`, payload).then((r) => r.data),
    customerReply: (id: string, reply: string) =>
      api.patch<ApiResult<null>>(`/part-requests/${id}/customer-reply`, { reply }).then((r) => r.data),
    setStatus: (id: string, status: PartRequestStatus) =>
      api.patch<ApiResult<null>>(`/part-requests/${id}/status`, { status }).then((r) => r.data)
  },
  reviews: {
    list: (params: { customerId?: string; page?: number; pageSize?: number }) =>
      api.get<ApiResult<PagedResult<ServiceReview>>>("/reviews", { params }).then((r) => r.data),
    create: (payload: CreateReviewPayload) =>
      api.post<ApiResult<ServiceReview>>("/reviews", payload).then((r) => r.data)
  }
};
