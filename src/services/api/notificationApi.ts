import { api } from "../../lib/axios";
import type { ApiResult } from "../../types/auth";

export interface NotificationItem {
  type: string;
  title: string;
  message: string;
  severity: "warning" | "error" | "info";
  count: number;
}

export const notificationApi = {
  get: () => api.get<ApiResult<NotificationItem[]>>("/notifications").then((r) => r.data)
};
