'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Priority } from '../types';
import { createCheck } from '../services/checksRepository';

interface AddCheckModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCheckModal({
  visible,
  onClose,
  onSuccess,
}: AddCheckModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [priority, setPriority] = useState<Priority>('medium');
  const [payee, setPayee] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [btnLoading, setBtnLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFormErrors({});
  }, [title, amount, payee, priority, date]);

  function validateForm() {
    const errors: { [key: string]: string } = {};
    if (!title.trim()) errors.title = 'Please enter a check title';
    const amt = parseFloat(amount);
    if (!amount.trim() || isNaN(amt) || amt <= 0)
      errors.amount = 'Please enter a valid amount';
    if (!(date instanceof Date) || isNaN(date.getTime()))
      errors.date = 'Please select a valid due date';
    if (payee?.trim() && payee?.trim().length < 2)
      errors.payee = 'Payee must be at least 2 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0 ? null : 'Please fix the errors';
  }

  async function handleAddCheck() {
    setBtnLoading(true);
    const error = validateForm();
    if (error) {
      setBtnLoading(false);
      return;
    }

    try {
      const toCreate = {
        title: title.trim(),
        amount: parseFloat(amount),
        dueDate: date.toISOString(),
        priority,
        payee: payee?.trim() || null,
        notificationId: null as string | null,
        currency,
      };
      await createCheck(toCreate as any);

      // Reset form
      setTitle('');
      setAmount('');
      setPayee('');
      setDate(new Date());
      setPriority('medium');
      setFormErrors({});
      onSuccess();
    } catch (error) {
      console.error('Error adding check:', error);
    } finally {
      setBtnLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">
            Add New Check
          </h2>
          <button
            className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold transition-colors ${
              btnLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-blue-600'
            }`}
            onClick={() => {
              alert('Notification API is supported in this browser.');
              Notification.requestPermission().then(result => {
                if (result === 'granted') {
                  // Permission granted, now you can show a notification
                  const title = 'New Message!';
                  const options = {
                    body: 'You have a new message from a friend.',
                    icon: '/images/icon-128.png', // Path to your notification icon
                  };
                  new Notification(title, options);
                } else {
                  console.log('Notification permission denied.');
                }
              });
            }}
          >
            <span>send</span>
          </button>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Check title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-900 border border-transparent focus:border-primary focus:outline-none"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-900 border border-transparent focus:border-primary focus:outline-none"
            />

            <input
              type="text"
              placeholder="Payee (to whom the check is written)"
              value={payee}
              onChange={e => setPayee(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-900 border border-transparent focus:border-primary focus:outline-none"
            />

            <div className="flex items-center mb-3">
              <span className="text-base mr-3 font-medium text-gray-900">
                Currency:
              </span>
              {['USD', 'JOD', 'ILS'].map(cur => (
                <button
                  key={cur}
                  className={`px-3 py-1.5 rounded-lg border mr-2 text-sm font-semibold transition-colors ${
                    currency === cur
                      ? 'border-primary bg-primary bg-opacity-20 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrency(cur)}
                >
                  {cur}
                </button>
              ))}
            </div>

            <div className="flex items-center mb-3">
              <span className="text-base mr-3 font-medium text-gray-900">
                Priority:
              </span>
              {['low', 'medium', 'high'].map(p => (
                <button
                  key={p}
                  className={`px-3 py-1.5 rounded-2xl border mr-2 text-sm font-medium transition-colors ${
                    priority === p
                      ? 'border-primary bg-primary bg-opacity-20 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setPriority(p as Priority)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3">
              <Calendar className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="date"
                value={date.toISOString().substr(0, 10)}
                onChange={e => setDate(new Date(e.target.value))}
                className="flex-1 text-base text-gray-900 bg-transparent outline-none"
              />
            </div>

            {Object.entries(formErrors).map(([key, value]) => (
              <p key={key} className="text-base text-red-500 font-medium">
                {value}
              </p>
            ))}

            <div className="flex space-x-2 pt-3">
              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl text-gray-700 font-semibold transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`flex-1 py-3 rounded-xl text-white font-semibold transition-colors ${
                  btnLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-blue-600'
                }`}
                onClick={handleAddCheck}
                disabled={btnLoading}
              >
                {btnLoading ? 'Adding...' : 'Add Check'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
