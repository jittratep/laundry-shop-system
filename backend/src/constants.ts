export const USER_ROLES = {
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
  FRONT_STAFF: "FRONT_STAFF",
  LAUNDRY_STAFF: "LAUNDRY_STAFF",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRole = keyof typeof USER_ROLES;