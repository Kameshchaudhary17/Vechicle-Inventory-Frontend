import type { Role } from "../constants";

export interface ApiResult<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  accessToken: string;
  expiresAt: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: number;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
