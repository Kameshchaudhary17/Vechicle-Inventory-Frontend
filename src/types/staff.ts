import type { Role } from "../constants";

export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role;
}

export interface UpdateStaffPayload {
  fullName: string;
  phoneNumber: string;
  role: Role;
}
