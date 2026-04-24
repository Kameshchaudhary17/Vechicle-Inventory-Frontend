import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { engagementApi } from "../../services/api/engagementApi";
import { qk } from "../../lib/query/keys";
import type {
  AppointmentStatus, CreateAppointmentPayload,
  CreatePartRequestPayload, ReplyPartRequestPayload, PartRequestStatus,
  CreateReviewPayload
} from "../../types/engagement";

export function useAppointments(params: { customerId?: string; status?: AppointmentStatus; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qk.appointments.list(params),
    queryFn: () => engagementApi.appointments.list(params),
    placeholderData: (prev) => prev,
    refetchInterval: 15_000
  });
}

export function useAppointmentMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.appointments.all });
  return {
    create: useMutation({ mutationFn: (p: CreateAppointmentPayload) => engagementApi.appointments.create(p), onSuccess: invalidate }),
    setStatus: useMutation({
      mutationFn: (v: { id: string; status: AppointmentStatus }) => engagementApi.appointments.setStatus(v.id, v.status),
      onSuccess: invalidate
    })
  };
}

export function usePartRequests(params: { customerId?: string; status?: PartRequestStatus; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qk.partRequests.list(params),
    queryFn: () => engagementApi.partRequests.list(params),
    placeholderData: (prev) => prev,
    refetchInterval: 15_000
  });
}

export function usePartRequestMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.partRequests.all });
  return {
    create: useMutation({ mutationFn: (p: CreatePartRequestPayload) => engagementApi.partRequests.create(p), onSuccess: invalidate }),
    reply: useMutation({
      mutationFn: (v: { id: string; payload: ReplyPartRequestPayload }) => engagementApi.partRequests.reply(v.id, v.payload),
      onSuccess: invalidate
    }),
    customerReply: useMutation({
      mutationFn: (v: { id: string; reply: string }) => engagementApi.partRequests.customerReply(v.id, v.reply),
      onSuccess: invalidate
    }),
    setStatus: useMutation({
      mutationFn: (v: { id: string; status: PartRequestStatus }) => engagementApi.partRequests.setStatus(v.id, v.status),
      onSuccess: invalidate
    })
  };
}

export function useReviews(params: { customerId?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qk.reviews.list(params),
    queryFn: () => engagementApi.reviews.list(params),
    placeholderData: (prev) => prev
  });
}

export function useReviewMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.reviews.all });
  return {
    create: useMutation({ mutationFn: (p: CreateReviewPayload) => engagementApi.reviews.create(p), onSuccess: invalidate })
  };
}
