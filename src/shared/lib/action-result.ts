export type AppActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

export function toActionError(error: unknown, fallback = "Unexpected error.") {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

