import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

const alertClasses = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

export const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '' }) => {
  const Icon = icons[type];
  
  return (
    <div className={`alert ${alertClasses[type]} ${className}`}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="btn btn-ghost btn-sm btn-square">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
