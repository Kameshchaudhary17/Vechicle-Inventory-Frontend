import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../../services/api/reportsApi";
import { qk } from "../../lib/query/keys";
import type { ReportBucket } from "../../types/reports";

export function useCustomerHistory(id: string | undefined) {
  return useQuery({
    queryKey: qk.reports.customerHistory(id ?? ""),
    queryFn: () => reportsApi.customerHistory(id!),
    enabled: !!id,
    refetchInterval: 20_000
  });
}

export function useCustomerInsights(top = 10, opts?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: qk.reports.customerInsights(top),
    queryFn: () => reportsApi.customerInsights(top),
    refetchInterval: opts?.refetchIntervalMs ?? 30_000
  });
}

export function useFinancialReport(bucket: ReportBucket, from?: string, to?: string) {
  return useQuery({
    queryKey: qk.reports.financial(bucket, from, to),
    queryFn: () => reportsApi.financial(bucket, from, to),
    refetchInterval: 30_000
  });
}
