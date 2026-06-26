/** Returns the current billing month as a YYYY-MM string (UTC). */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}
