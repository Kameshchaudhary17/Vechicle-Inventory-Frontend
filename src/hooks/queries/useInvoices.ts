import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseInvoiceApi, salesInvoiceApi } from "../../services/api/invoiceApi";
import { qk } from "../../lib/query/keys";
import type { CreatePurchaseInvoicePayload, CreateSalesInvoicePayload, PaymentStatus } from "../../types/invoices";

export function usePurchaseInvoiceList(params: { search?: string; vendorId?: string; from?: string; to?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qk.purchaseInvoices.list(params),
    queryFn: () => purchaseInvoiceApi.list(params),
    placeholderData: (prev) => prev
  });
}

export function usePurchaseStats(opts?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: qk.purchaseInvoices.stats(),
    queryFn: () => purchaseInvoiceApi.stats(),
    refetchInterval: opts?.refetchIntervalMs ?? 15_000
  });
}

export function usePurchaseInvoice(id: string | undefined) {
  return useQuery({
    queryKey: qk.purchaseInvoices.detail(id ?? ""),
    queryFn: () => purchaseInvoiceApi.get(id!),
    enabled: !!id
  });
}

export function usePurchaseMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.purchaseInvoices.all });
    qc.invalidateQueries({ queryKey: qk.parts.all });
  };
  return {
    create: useMutation({ mutationFn: (p: CreatePurchaseInvoicePayload) => purchaseInvoiceApi.create(p), onSuccess: invalidate })
  };
}

export function useSalesInvoiceList(params: { search?: string; customerId?: string; status?: PaymentStatus; from?: string; to?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qk.salesInvoices.list(params),
    queryFn: () => salesInvoiceApi.list(params),
    placeholderData: (prev) => prev
  });
}

export function useSalesStats(opts?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: qk.salesInvoices.stats(),
    queryFn: () => salesInvoiceApi.stats(),
    refetchInterval: opts?.refetchIntervalMs ?? 10_000
  });
}

export function useSalesInvoice(id: string | undefined) {
  return useQuery({
    queryKey: qk.salesInvoices.detail(id ?? ""),
    queryFn: () => salesInvoiceApi.get(id!),
    enabled: !!id
  });
}

export function useSalesMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.salesInvoices.all });
    qc.invalidateQueries({ queryKey: qk.parts.all });
    qc.invalidateQueries({ queryKey: qk.customers.all });
    qc.invalidateQueries({ queryKey: qk.reports.all });
  };
  return {
    create: useMutation({ mutationFn: (p: CreateSalesInvoicePayload) => salesInvoiceApi.create(p), onSuccess: invalidate }),
    email: useMutation({
      mutationFn: (v: { id: string; email?: string }) => salesInvoiceApi.email(v.id, v.email),
      onSuccess: invalidate
    })
  };
}
