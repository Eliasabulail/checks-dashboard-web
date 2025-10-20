export function getDaysLeft(dueDateIso: string): number {
  const due = new Date(dueDateIso);
  const now = new Date();
  // Strip times (set both to midnight so only Y/M/D is compared)
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString();
}