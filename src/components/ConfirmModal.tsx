import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-start gap-3 mb-4">
          <div className={`flex ${type === 'danger' ? 'text-error' : type === 'warning' ? 'text-warning' : 'text-info'}`}>
            <div className="bg-transparent rounded-full w-8 h-8 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-base-content/70 mt-1">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost">
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm} 
            className={`btn ${type === 'danger' ? 'btn-error' : type === 'warning' ? 'btn-warning' : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
