export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "returned"
  | "active";

export type UserRole = "admin" | "processor";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
