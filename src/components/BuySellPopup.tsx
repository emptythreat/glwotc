import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useDeveloperMode } from '../contexts/DeveloperModeContext';
import { Order } from '../types';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface BuySellPopupProps {
  order: Order;
  isBuyOrder: boolean;
  onClose: () => void;
  onCancel: (orderId: string) => void;
}

const BuySellPopup: React.FC<BuySellPopupProps> = ({ order, isBuyOrder, onClose, onCancel }) => {
  const { address } = useWallet();
  const { isDeveloperMode, protocolFee } = useDeveloperMode();
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleConfirm = async () => {
    setIsExecuting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessage(`Transaction confirmed successfully! ${isBuyOrder ? 'Bought' : 'Sold'} ${order.quantity.toFixed(2)} GLW.`);
      setTimeout(() => {
        onClose();
        onCancel(order.id); // Remove the executed order from the order book
      }, 2000);
    } catch (error) {
      console.error('Error simulating transaction:', error);
      setErrorMessage('Failed to simulate transaction. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isBuyOrder ? 'Buy' : 'Sell'} Order Confirmation
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-6">
          <p className="mb-2">
            <span className="font-semibold">Price:</span> ${order.price.toFixed(2)} USDC
          </p>
          <p className="mb-2">
            <span className="font-semibold">Quantity:</span> {order.quantity.toFixed(2)} GLW
          </p>
          <p className="mb-2">
            <span className="font-semibold">Total:</span> ${order.total.toFixed(2)} USDC
          </p>
          {isDeveloperMode && (
            <p className="mb-2">
              <span className="font-semibold">Protocol Fee:</span> {(protocolFee * 100).toFixed(2)}%
            </p>
          )}
        </div>
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded flex items-center">
            <CheckCircle size={20} className="mr-2" />
            {successMessage}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isExecuting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isExecuting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isExecuting ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuySellPopup;