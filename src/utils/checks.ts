import { CheckItem, DashboardStats, Priority } from '../types';
import { getDaysLeft } from './date';

export function getDashboardStats(checks: CheckItem[]): DashboardStats {
  const now = new Date();
  const totalAmount = checks.reduce((sum: number, check: CheckItem) => sum + check.amount, 0);
  const overdueCount = checks.filter((check: CheckItem) => new Date(check.dueDate) < now).length;
  const upcomingCount = checks.filter((check: CheckItem) => {
    const days = getDaysLeft(check.dueDate);
    return days > 0 && days <= 7;
  }).length;

  return { totalAmount, overdueCount, upcomingCount, totalChecks: checks.length };
}

export function getCurrencyStats(checks: CheckItem[]): Record<string, { count: number; totalAmount: number }> {
  return checks.reduce((stats, check) => {
    if (!stats[check.currency]) {
      stats[check.currency] = { count: 0, totalAmount: 0 };
    }
    stats[check.currency].count++;
    stats[check.currency].totalAmount += check.amount;
    return stats;
  }, {} as Record<string, { count: number; totalAmount: number }>);
}

export function filterChecks(
  checks: CheckItem[],
  searchQuery: string,
  selectedFilter: 'all' | 'today' | 'overdue' | 'upcoming' | 'completed' | 'removed'
): CheckItem[] {
  let filtered = checks;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((c: CheckItem) =>
      c.title.toLowerCase().includes(q) || (c.payee && c.payee.toLowerCase().includes(q))
    );
  }

  const now = new Date();
  switch (selectedFilter) {
    case 'overdue':
      filtered = filtered.filter((c: CheckItem) => {
        const due = new Date(c.dueDate);
        return due < new Date(now.getFullYear(), now.getMonth(), now.getDate()) && !c.paid;
      });
      break;
    case 'upcoming':
      filtered = filtered.filter((c: CheckItem) => {
        const days = getDaysLeft(c.dueDate);
        return days > 0 && days <= 7 && !c.paid;
      });
      break;
    case 'completed':
      filtered = filtered.filter((c: CheckItem) => c.paid);
      break;
    case 'today':
      filtered = filtered.filter((c: CheckItem) => {
        const due = new Date(c.dueDate);
        return (
          due.getFullYear() === now.getFullYear() &&
          due.getMonth() === now.getMonth() &&
          due.getDate() === now.getDate() &&
          !c.paid
        );
      });
      break;
    // 'all' is default
  }

  return filtered.sort(
    (a: CheckItem, b: CheckItem) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

export function getStatusInfo(item: CheckItem) {
  if (item.paid) return { status: 'complete', color: '#34C759', text: 'Complete' };
  const daysLeft = getDaysLeft(item.dueDate);
  if (daysLeft < 0) return { status: 'overdue', color: '#FF3B30', text: `${Math.abs(daysLeft)} days overdue` };
  if (daysLeft === 0) return { status: 'due', color: '#FF9500', text: 'Due today' };
  if (daysLeft <= 3) return { status: 'urgent', color: '#FF9500', text: `${daysLeft} days left` };
  if (daysLeft <= 7) return { status: 'upcoming', color: '#34C759', text: `${daysLeft} days left` };
  return { status: 'future', color: '#8E8E93', text: `${daysLeft} days left` };
}

export function getPriorityColor(priority: Priority | undefined) {
  switch (priority) {
    case 'high':
      return '#FF3B30';
    case 'medium':
      return '#FF9500';
    case 'low':
      return '#34C759';
    default:
      return '#8E8E93';
  }
}


