export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19);
}
