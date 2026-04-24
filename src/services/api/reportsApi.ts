import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { CustomerHistory, CustomerInsights, FinancialReport, ReportBucket } from "../../types/reports";

export const reportsApi = {
  customerHistory: (id: string) =>
    api.get<ApiResult<CustomerHistory>>(`/reports/customers/${id}/history`).then((r) => r.data),
  customerInsights: (top = 10) =>
    api.get<ApiResult<CustomerInsights>>("/reports/customer-insights", { params: { top } }).then((r) => r.data),
  financial: (bucket: ReportBucket, from?: string, to?: string) =>
    api.get<ApiResult<FinancialReport>>("/reports/financial", { params: { bucket, from, to } }).then((r) => r.data)
};
