export interface CustomerVehicle {
  id: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year?: number | null;
  color?: string | null;
  vinNumber?: string | null;
}

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  userId?: string | null;
  vehicleCount: number;
  vehicles: CustomerVehicle[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface CustomerListItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  isActive: boolean;
  vehicleCount: number;
  primaryVehicleNumber?: string | null;
  createdAt: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  totalVehicles: number;
}

export interface CreateVehicleForCustomerPayload {
  vehicleNumber: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  vinNumber?: string;
  notes?: string;
}

export interface CreateCustomerPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  notes?: string;
  vehicles?: CreateVehicleForCustomerPayload[];
}

export interface UpdateCustomerPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  customerName: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year?: number | null;
  color?: string | null;
  vinNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface VehicleUpsertPayload {
  vehicleNumber: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  vinNumber?: string;
  notes?: string;
}
