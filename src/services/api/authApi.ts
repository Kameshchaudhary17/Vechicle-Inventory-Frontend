import { api } from "../../lib/axios";
import type {
  ApiResult,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload
} from "../../types/auth";

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<ApiResult<string>>("/auth/register", payload).then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<ApiResult<AuthResponse>>("/auth/verify-otp", payload).then((r) => r.data),

  resendOtp: (email: string) =>
    api.post<ApiResult<null>>("/auth/resend-otp", { email }).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<ApiResult<AuthResponse>>("/auth/login", payload).then((r) => r.data),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post<ApiResult<string>>("/auth/change-password", payload).then((r) => r.data)
};
