import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  service?: string;
  onClose: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, service, onClose }) => {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-800">
              {service ? `${service.charAt(0).toUpperCase() + service.slice(1)} Error` : 'Error'}
            </h3>
            <p className="text-sm text-red-700 mt-1">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-red-100 transition-colors"
            aria-label="Close error message"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;