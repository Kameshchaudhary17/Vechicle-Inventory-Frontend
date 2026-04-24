export const ROLES = {
  Admin: "Admin",
  Staff: "Staff",
  Customer: "Customer"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STORAGE_KEYS = {
  accessToken: "vi_access_token",
  user: "vi_user"
} as const;

export const CURRENCY = "NPR";
