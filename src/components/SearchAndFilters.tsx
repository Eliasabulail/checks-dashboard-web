'use client';

import React from 'react';
import { Search, List, Sun, AlertTriangle, Clock, CheckCircle2, Trash2 } from 'lucide-react';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: 'all' | 'today' | 'overdue' | 'upcoming' | 'completed' | 'removed';
  setSelectedFilter: (filter: 'all' | 'today' | 'overdue' | 'upcoming' | 'completed' | 'removed') => void;
}

export default function SearchAndFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedFilter, 
  setSelectedFilter 
}: SearchAndFiltersProps) {
  const filterOptions = [
    { key: 'all', label: 'All', icon: List },
    { key: 'today', label: 'Today', icon: Sun },
    { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
    { key: 'upcoming', label: 'Upcoming', icon: Clock },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
    { key: 'removed', label: 'Removed', icon: Trash2 },
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center bg-white rounded-xl px-4 py-3 mb-3 shadow-sm">
        <Search className="w-5 h-5 text-gray-500 mr-3" />
        <input
          type="text"
          placeholder="Search checks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-base text-gray-900 outline-none"
        />
      </div>
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {filterOptions.map(filter => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.key}
              className={`flex items-center px-4 py-2 rounded-2xl border transition-colors whitespace-nowrap ${
                selectedFilter === (filter.key as any)
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFilter(filter.key as any)}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              <span className="text-sm font-medium">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
