'use client';

import React from 'react';
import { CheckItem } from '../types';
import { getPriorityColor, getStatusInfo } from '../utils/checks';
import { Trash2, CheckCircle2, Circle, DollarSign, Calendar } from 'lucide-react';

type Props = {
  item: CheckItem;
  onDelete: (item: CheckItem) => void;
  onTogglePaid?: (paid: boolean) => void;
  onPress?: () => void;
};

export default function CheckCard({ item, onDelete, onTogglePaid, onPress }: Props) {
  const statusInfo = getStatusInfo(item);
  const priorityColor = getPriorityColor(item.priority || 'medium');
  const due = new Date(item.dueDate);

  return (
    <div 
      className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${
        onPress ? 'cursor-pointer' : ''
      }`}
      onClick={onPress}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 flex items-center flex-wrap">
          <h3 className="text-lg font-semibold text-gray-900 mr-2">{item.title}</h3>
          {item.payee && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
              {item.payee}
            </span>
          )}
        </div>
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: priorityColor }}
        />
      </div>

      <div className="flex justify-between mb-3">
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 text-gray-500 mr-1.5" />
          <span className="text-base font-semibold text-gray-900">
            {item.currency === 'USD' ? '$' : ''}{item.amount.toFixed(2)} {item.currency !== 'USD' ? item.currency : ''}
          </span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-500 mr-1.5" />
          <span className="text-sm text-gray-600">{due.toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span 
          className="px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ 
            backgroundColor: statusInfo.color + '20',
            color: statusInfo.color 
          }}
        >
          {statusInfo.text}
        </span>
        
        <div className="flex items-center space-x-2">
          {typeof item.paid === 'boolean' && onTogglePaid && (
            <button 
              className="flex items-center space-x-1 text-sm font-medium hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePaid(!item.paid);
              }}
            >
              {item.paid ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
              <span className={item.paid ? 'text-green-500' : 'text-gray-400'}>
                {item.paid ? 'Paid' : 'Mark Paid'}
              </span>
            </button>
          )}
          
          <button
            className={`p-2 rounded-lg hover:bg-red-50 transition-colors ${
              item.paid ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!item.paid) {
                onDelete(item);
              }
            }}
            disabled={item.paid}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}