import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
      <AlertCircle className="flex-shrink-0 mr-2" size={20} />
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorMessage;