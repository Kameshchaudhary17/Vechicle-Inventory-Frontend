export type PaymentStatus = "Paid" | "Credit" | "Partial";

export interface PurchaseInvoiceItem {
  id: string;
  partId: string;
  partCode: string;
  partName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendorId: string;
  vendorName: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string | null;
  items: PurchaseInvoiceItem[];
  createdAt: string;
}

export interface PurchaseInvoiceListItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  lineCount: number;
  createdAt: string;
}

export interface PurchaseStats {
  totalInvoices: number;
  totalSpend: number;
  thisMonthSpend: number;
  invoicesThisMonth: number;
}

export interface CreatePurchaseInvoicePayload {
  invoiceNumber: string;
  invoiceDate: string;
  vendorId: string;
  discountAmount: number;
  taxAmount: number;
  notes?: string;
  items: { partId: string; quantity: number; unitCost: number }[];
}

export interface SalesInvoiceItem {
  id: string;
  partId: string;
  partCode: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  vehicleId?: string | null;
  vehicleNumber?: string | null;
  subTotal: number;
  loyaltyDiscount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  loyaltyApplied: boolean;
  notes?: string | null;
  emailedAt?: string | null;
  items: SalesInvoiceItem[];
  createdAt: string;
}

export interface SalesInvoiceListItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  vehicleNumber?: string | null;
  totalAmount: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  lineCount: number;
  createdAt: string;
}

export interface SalesStats {
  todaySales: number;
  todayInvoices: number;
  monthSales: number;
  monthInvoices: number;
  pendingCredits: number;
  pendingCreditInvoices: number;
}

export interface CreateSalesInvoicePayload {
  customerId: string;
  vehicleId?: string;
  invoiceDate?: string;
  discountAmount: number;
  taxAmount: number;
  paidAmount: number;
  notes?: string;
  items: { partId: string; quantity: number; unitPrice?: number }[];
}
