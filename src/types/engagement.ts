export type AppointmentStatus = "Requested" | "Confirmed" | "Completed" | "Cancelled";
export type PartRequestStatus = "Open" | "Quoted" | "Fulfilled" | "Closed";

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId?: string | null;
  vehicleNumber?: string | null;
  scheduledAt: string;
  serviceType: string;
  notes?: string | null;
  status: AppointmentStatus;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  customerId?: string;
  vehicleId?: string;
  scheduledAt: string;
  serviceType: string;
  notes?: string;
}

export interface PartRequest {
  id: string;
  customerId: string;
  customerName: string;
  partName: string;
  description?: string | null;
  vehicleInfo?: string | null;
  status: PartRequestStatus;
  staffReply?: string | null;
  repliedAt?: string | null;
  customerReply?: string | null;
  customerRepliedAt?: string | null;
  createdAt: string;
}

export interface CreatePartRequestPayload {
  customerId?: string;
  partName: string;
  description?: string;
  vehicleInfo?: string;
}

export interface ReplyPartRequestPayload {
  reply: string;
  status: PartRequestStatus;
}

export interface ServiceReview {
  id: string;
  customerId: string;
  customerName: string;
  salesInvoiceId?: string | null;
  invoiceNumber?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface CreateReviewPayload {
  customerId?: string;
  salesInvoiceId?: string;
  rating: number;
  comment?: string;
}
