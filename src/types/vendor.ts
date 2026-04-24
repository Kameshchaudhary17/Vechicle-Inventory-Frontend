export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string | null;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  panNumber?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface VendorStats {
  total: number;
  active: number;
  inactive: number;
}

export interface VendorPayload {
  name: string;
  phoneNumber: string;
  contactPerson?: string;
  email?: string;
  address?: string;
  panNumber?: string;
  notes?: string;
}
