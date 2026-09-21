export function getDaysRemaining(
  denNgay?: string | Date | null,
  now: Date = new Date()
): number | null {
  if (!denNgay) return null;
  const end = new Date(denNgay);
  if (isNaN(end.getTime())) return null;
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(
  denNgay?: string | Date | null,
  now: Date = new Date()
): boolean {
  const days = getDaysRemaining(denNgay, now);
  return days !== null && days <= 15 && days >= 0;
}
