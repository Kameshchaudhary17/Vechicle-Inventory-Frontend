export const qk = {
  vendors: {
    all: ["vendors"] as const,
    list: (params: Record<string, unknown>) => ["vendors", "list", params] as const,
    stats: () => ["vendors", "stats"] as const,
    detail: (id: string) => ["vendors", "detail", id] as const
  },
  parts: {
    all: ["parts"] as const,
    list: (params: Record<string, unknown>) => ["parts", "list", params] as const,
    stats: () => ["parts", "stats"] as const,
    detail: (id: string) => ["parts", "detail", id] as const
  },
  categories: {
    all: ["categories"] as const,
    list: (params: Record<string, unknown>) => ["categories", "list", params] as const,
    lookup: () => ["categories", "lookup"] as const
  },
  staff: {
    all: ["staff"] as const,
    list: (params: Record<string, unknown>) => ["staff", "list", params] as const,
    detail: (id: string) => ["staff", "detail", id] as const
  },
  customers: {
    all: ["customers"] as const,
    list: (params: Record<string, unknown>) => ["customers", "list", params] as const,
    stats: () => ["customers", "stats"] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
    vehicles: (id: string) => ["customers", id, "vehicles"] as const
  },
  purchaseInvoices: {
    all: ["purchase-invoices"] as const,
    list: (params: Record<string, unknown>) => ["purchase-invoices", "list", params] as const,
    stats: () => ["purchase-invoices", "stats"] as const,
    detail: (id: string) => ["purchase-invoices", "detail", id] as const
  },
  salesInvoices: {
    all: ["sales-invoices"] as const,
    list: (params: Record<string, unknown>) => ["sales-invoices", "list", params] as const,
    stats: () => ["sales-invoices", "stats"] as const,
    detail: (id: string) => ["sales-invoices", "detail", id] as const
  },
  reports: {
    all: ["reports"] as const,
    customerHistory: (id: string) => ["reports", "customer-history", id] as const,
    customerInsights: (top: number) => ["reports", "customer-insights", top] as const,
    financial: (bucket: string, from?: string, to?: string) => ["reports", "financial", bucket, from, to] as const
  },
  appointments: {
    all: ["appointments"] as const,
    list: (params: Record<string, unknown>) => ["appointments", "list", params] as const
  },
  partRequests: {
    all: ["part-requests"] as const,
    list: (params: Record<string, unknown>) => ["part-requests", "list", params] as const
  },
  reviews: {
    all: ["reviews"] as const,
    list: (params: Record<string, unknown>) => ["reviews", "list", params] as const
  },
  me: {
    profile: ["me", "profile"] as const,
    vehicles: ["me", "vehicles"] as const
  }
};
