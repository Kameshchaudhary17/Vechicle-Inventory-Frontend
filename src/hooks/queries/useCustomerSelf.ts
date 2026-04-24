import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerSelfApi } from "../../services/api/customerSelfApi";
import { qk } from "../../lib/query/keys";
import type { UpdateCustomerPayload, VehicleUpsertPayload } from "../../types/customer";

export function useMyProfile() {
  return useQuery({
    queryKey: qk.me.profile,
    queryFn: () => customerSelfApi.profile(),
    refetchInterval: 20_000
  });
}

export function useMyVehicles() {
  return useQuery({
    queryKey: qk.me.vehicles,
    queryFn: () => customerSelfApi.listVehicles(),
    refetchInterval: 20_000
  });
}

export function useMyMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.me.profile });
    qc.invalidateQueries({ queryKey: qk.me.vehicles });
  };
  return {
    updateProfile: useMutation({ mutationFn: (p: UpdateCustomerPayload) => customerSelfApi.updateProfile(p), onSuccess: invalidate }),
    addVehicle: useMutation({ mutationFn: (p: VehicleUpsertPayload) => customerSelfApi.addVehicle(p), onSuccess: invalidate }),
    updateVehicle: useMutation({
      mutationFn: (v: { id: string; payload: VehicleUpsertPayload }) => customerSelfApi.updateVehicle(v.id, v.payload),
      onSuccess: invalidate
    }),
    removeVehicle: useMutation({ mutationFn: (id: string) => customerSelfApi.removeVehicle(id), onSuccess: invalidate })
  };
}
