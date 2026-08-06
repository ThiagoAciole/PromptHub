export function buildQueryString(params: object): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, string | number | boolean | undefined | null][]) {
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) continue;
    query.set(key, typeof value === "string" ? value.trim() : String(value));
  }
  return query.toString();
}
