export type Priority = 'low' | 'medium' | 'high';

export type CheckItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  notificationId?: string | null;
  priority?: Priority;
  payee: string; // now required
  paid?: boolean; // new status
  currency: string; // currency of the check
};

export type DashboardStats = {
  totalAmount: number;
  overdueCount: number;
  upcomingCount: number;
  totalChecks: number;
};


