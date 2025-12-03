import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Terminal, X } from 'lucide-react';
import { NotificationType } from '../types';

interface ToastProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-white border-green-200 text-green-700 dark:bg-green-950/90 dark:border-green-900/50 dark:text-green-200',
    error: 'bg-white border-red-200 text-red-700 dark:bg-red-950/90 dark:border-red-900/50 dark:text-red-200',
    info: 'bg-white border-gray-200 text-gray-700 dark:bg-neutral-800/90 dark:border-neutral-700 dark:text-neutral-200'
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Terminal
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-in slide-in-from-right-5 fade-in duration-300`}>
      <div className={`px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md flex items-start gap-3 ${styles[type]}`}>
        <Icon size={18} className="mt-0.5 shrink-0" />
        <div className="flex-1 text-sm font-medium leading-tight pt-0.5">{message}</div>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};