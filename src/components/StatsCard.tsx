'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div 
      className="bg-white rounded-xl p-3.5 w-full sm:w-[48%] mb-3 border-t-4 shadow-sm" 
      style={{ borderTopColor: color }}
    >
      <div className="flex items-center">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center mr-2.5" 
          style={{ backgroundColor: color + '20' }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-900 mb-0.5">{value}</div>
          <div className="text-xs text-gray-500">{title}</div>
        </div>
      </div>
    </div>
  );
}
