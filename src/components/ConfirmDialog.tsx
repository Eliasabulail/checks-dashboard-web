'use client';

import React, { useState } from 'react';

type ConfirmDialogProps = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Yes',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-11/12 max-w-md">
        {title && (
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        )}
        {message && (
          <p className="text-base text-gray-700 mb-5">{message}</p>
        )}
        <div className="flex justify-end space-x-3">
          <button
            disabled={loading}
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg text-gray-700 font-semibold transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await onConfirm();
              } finally {
                setLoading(false);
              }
            }}
            className="bg-primary hover:bg-blue-600 px-4 py-2.5 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;