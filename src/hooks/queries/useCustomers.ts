import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../../services/api/customerApi";
import { qk } from "../../lib/query/keys";
import type { CreateCustomerPayload, UpdateCustomerPayload, VehicleUpsertPayload } from "../../types/customer";

export function useCustomerList(params: {
  search?: string; vehicleNumber?: string; phone?: string;
  activeOnly?: boolean; page?: number; pageSize?: number;
}) {
  return useQuery({
    queryKey: qk.customers.list(params),
    queryFn: () => customerApi.list(params),
    placeholderData: (prev) => prev
  });
}

export function useCustomerStats(opts?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: qk.customers.stats(),
    queryFn: () => customerApi.stats(),
    refetchInterval: opts?.refetchIntervalMs ?? 15_000
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: qk.customers.detail(id ?? ""),
    queryFn: () => customerApi.get(id!),
    enabled: !!id,
    refetchInterval: 15_000
  });
}

export function useCustomerMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.customers.all });

  return {
    create: useMutation({ mutationFn: (p: CreateCustomerPayload) => customerApi.create(p), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: (v: { id: string; payload: UpdateCustomerPayload }) => customerApi.update(v.id, v.payload),
      onSuccess: invalidate
    }),
    setActive: useMutation({
      mutationFn: (v: { id: string; isActive: boolean }) => customerApi.setActive(v.id, v.isActive),
      onSuccess: invalidate
    }),
    remove: useMutation({ mutationFn: (id: string) => customerApi.remove(id), onSuccess: invalidate }),

    addVehicle: useMutation({
      mutationFn: (v: { customerId: string; payload: VehicleUpsertPayload }) =>
        customerApi.addVehicle(v.customerId, v.payload),
      onSuccess: invalidate
    }),
    updateVehicle: useMutation({
      mutationFn: (v: { customerId: string; vehicleId: string; payload: VehicleUpsertPayload }) =>
        customerApi.updateVehicle(v.customerId, v.vehicleId, v.payload),
      onSuccess: invalidate
    }),
    removeVehicle: useMutation({
      mutationFn: (v: { customerId: string; vehicleId: string }) =>
        customerApi.removeVehicle(v.customerId, v.vehicleId),
      onSuccess: invalidate
    })
  };
}
