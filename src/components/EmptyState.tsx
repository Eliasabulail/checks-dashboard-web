'use client';

import React from 'react';
import { Trash2, Sun, AlertTriangle, CheckCircle2, List } from 'lucide-react';

interface EmptyStateProps {
  filter: 'all' | 'today' | 'overdue' | 'upcoming' | 'completed' | 'removed';
  searchQuery: string;
}

export default function EmptyState({ filter, searchQuery }: EmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (filter) {
      case 'removed':
        return {
          icon: <Trash2 className="w-16 h-16 text-gray-300 mb-4" />,
          title: 'No removed checks',
          subtitle: 'Deleted checks will appear here'
        };
      case 'today':
        return {
          icon: <Sun className="w-16 h-16 text-gray-300 mb-4" />,
          title: 'No checks due today',
          subtitle: null
        };
      case 'overdue':
        return {
          icon: <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />,
          title: 'No overdue checks',
          subtitle: null
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-gray-300 mb-4" />,
          title: 'No completed checks',
          subtitle: null
        };
      default:
        return {
          icon: <List className="w-16 h-16 text-gray-300 mb-4" />,
          title: 'No checks found',
          subtitle: searchQuery
            ? 'Try adjusting your search'
            : 'Add your first check to get started'
        };
    }
  };

  const { icon, title, subtitle } = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {icon}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {subtitle && (
        <p className="text-base text-gray-500 text-center">{subtitle}</p>
      )}
    </div>
  );
}
