import type { PaymentStatus } from "./invoices";

export interface CustomerHistoryInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  vehicleNumber?: string | null;
  totalAmount: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  lineCount: number;
}

export interface CustomerHistory {
  customerId: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  totalPurchases: number;
  totalSpent: number;
  outstandingBalance: number;
  lastPurchaseAt?: string | null;
  invoices: CustomerHistoryInvoice[];
}

export interface CustomerRank {
  customerId: string;
  fullName: string;
  phoneNumber: string;
  purchaseCount: number;
  totalSpent: number;
  lastPurchaseAt?: string | null;
}

export interface CustomerCredit {
  customerId: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  outstandingBalance: number;
  openInvoices: number;
  oldestUnpaidAt?: string | null;
  daysOldest: number;
}

export interface CustomerInsights {
  topSpenders: CustomerRank[];
  regulars: CustomerRank[];
  pendingCredits: CustomerCredit[];
}

export type ReportBucket = "Day" | "Month" | "Year";

export interface FinancialPoint {
  label: string;
  bucketStart: string;
  revenue: number;
  cost: number;
  profit: number;
  invoiceCount: number;
}

export interface FinancialReport {
  bucket: ReportBucket;
  fromUtc: string;
  toUtc: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  invoiceCount: number;
  series: FinancialPoint[];
}
