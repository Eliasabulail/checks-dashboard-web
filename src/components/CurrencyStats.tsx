'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import { CheckItem } from '../types';
import { getCurrencyStats } from '../utils/checks';

interface CurrencyStatsProps {
  checks: CheckItem[];
}

export default function CurrencyStats({ checks }: CurrencyStatsProps) {
  const currencyStats = getCurrencyStats(checks);

  const getCurrencyColor = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '#1976D2';
      case 'JOD':
        return '#388e3c';
      default:
        return '#d32f2f';
    }
  };

  return (
    <>
      {Object.entries(currencyStats).map(([cur, obj]) => {
        const color = getCurrencyColor(cur);
        return (
          <div
            key={cur}
            className="bg-white rounded-xl p-3.5 border-t-4 shadow-sm"
            style={{ borderTopColor: color }}
          >
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-2.5"
                style={{ backgroundColor: color + '20' }}
              >
                <DollarSign className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-gray-900 mb-0.5 truncate">
                  {cur === 'USD' ? '$' : ''}
                  {obj.totalAmount.toFixed(2)}
                  {cur !== 'USD' ? ' ' + cur : ''}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {cur} • {obj.count} Check{obj.count > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
