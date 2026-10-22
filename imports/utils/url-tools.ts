/**
 * Get the value of a query parameter by name
 */
export function getQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name) ?? undefined;
}
