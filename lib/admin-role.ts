export function normalizeRole(role: unknown): string {
  if (typeof role !== "string") return ""
  return role.replace(/"/g, "").trim().toLowerCase()
}

export function hasAdminFlag(user: {
  user_metadata?: Record<string, unknown>
  raw_user_meta_data?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  raw_app_meta_data?: Record<string, unknown>
} | null | undefined): boolean {
  const candidates = [
    user?.user_metadata?.is_admin,
    user?.raw_user_meta_data?.is_admin,
    user?.app_metadata?.is_admin,
    user?.raw_app_meta_data?.is_admin,
  ]

  return candidates.some((value) => value === true || value === "true" || value === 1 || value === "1")
}

export function isAdminUser(role: unknown, user: {
  user_metadata?: Record<string, unknown>
  raw_user_meta_data?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  raw_app_meta_data?: Record<string, unknown>
} | null | undefined): boolean {
  return normalizeRole(role) === "admin" || hasAdminFlag(user)
}
