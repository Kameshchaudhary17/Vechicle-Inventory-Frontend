import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";
import type { PagedResult } from "../../types/common";
import type {
  PurchaseInvoice, PurchaseInvoiceListItem, PurchaseStats, CreatePurchaseInvoicePayload,
  SalesInvoice, SalesInvoiceListItem, SalesStats, CreateSalesInvoicePayload, PaymentStatus
} from "../../types/invoices";

export const purchaseInvoiceApi = {
  list: (params: { search?: string; vendorId?: string; from?: string; to?: string; page?: number; pageSize?: number }) =>
    api.get<ApiResult<PagedResult<PurchaseInvoiceListItem>>>("/admin/purchase-invoices", { params }).then((r) => r.data),
  stats: () =>
    api.get<ApiResult<PurchaseStats>>("/admin/purchase-invoices/stats").then((r) => r.data),
  get: (id: string) =>
    api.get<ApiResult<PurchaseInvoice>>(`/admin/purchase-invoices/${id}`).then((r) => r.data),
  create: (payload: CreatePurchaseInvoicePayload) =>
    api.post<ApiResult<PurchaseInvoice>>("/admin/purchase-invoices", payload).then((r) => r.data)
};

export const salesInvoiceApi = {
  list: (params: { search?: string; customerId?: string; status?: PaymentStatus; from?: string; to?: string; page?: number; pageSize?: number }) =>
    api.get<ApiResult<PagedResult<SalesInvoiceListItem>>>("/sales-invoices", { params }).then((r) => r.data),
  stats: () =>
    api.get<ApiResult<SalesStats>>("/sales-invoices/stats").then((r) => r.data),
  get: (id: string) =>
    api.get<ApiResult<SalesInvoice>>(`/sales-invoices/${id}`).then((r) => r.data),
  create: (payload: CreateSalesInvoicePayload) =>
    api.post<ApiResult<SalesInvoice>>("/sales-invoices", payload).then((r) => r.data),
  email: (id: string, overrideEmail?: string) =>
    api.post<ApiResult<null>>(`/sales-invoices/${id}/email`, { email: overrideEmail }).then((r) => r.data)
};
