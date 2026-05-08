export function normalizeRole(role: unknown): string {
  if (typeof role !== "string") return ""
  return role.replace(/"/g, "").trim().toLowerCase()
}

// Only check app_metadata — it is server-controlled and cannot be edited by users.
// Never check user_metadata/raw_user_meta_data: users can set those themselves.
export function hasAdminFlag(user: {
  app_metadata?: Record<string, unknown>
  raw_app_meta_data?: Record<string, unknown>
} | null | undefined): boolean {
  const candidates = [
    user?.app_metadata?.is_admin,
    user?.raw_app_meta_data?.is_admin,
  ]
  return candidates.some((v) => v === true || v === "true" || v === 1 || v === "1")
}

export function isAdminUser(role: unknown, user: {
  app_metadata?: Record<string, unknown>
  raw_app_meta_data?: Record<string, unknown>
} | null | undefined): boolean {
  return normalizeRole(role) === "admin" || hasAdminFlag(user)
}
