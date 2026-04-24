import type { Role } from "../../constants";

export const roleHome = (role: Role | undefined): string => {
  switch (role) {
    case "Admin": return "/admin";
    case "Staff": return "/staff";
    case "Customer": return "/customer";
    default: return "/login";
  }
};
