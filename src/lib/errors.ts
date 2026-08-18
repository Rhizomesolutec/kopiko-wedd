/** Safely extracts a human-readable message from an unknown catch value. */
export function getErrorMessage(err: unknown, fallback = "Internal server error"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/** HTTP status helper shared by every automation route's catch block. */
export function statusForError(message: string): number {
  return message === "Unauthorized" ? 401 : 500;
}
