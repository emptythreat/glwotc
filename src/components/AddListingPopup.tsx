import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useDeveloperMode } from '../contexts/DeveloperModeContext';
import { X, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface AddListingPopupProps {
  isBuyOrder: boolean;
  onClose: () => void;
  onNewOrder: (order: Order) => void;
}

const AddListingPopup: React.FC<AddListingPopupProps> = ({ isBuyOrder, onClose, onNewOrder }) => {
  const { address } = useWallet();
  const { isDeveloperMode } = useDeveloperMode();
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const priceValue = parseFloat(price);
    const quantityValue = parseFloat(quantity);

    if (!isDeveloperMode && (priceValue <= 0 || quantityValue <= 0)) {
      setErrorMessage('Price and quantity must be greater than 0.');
      return;
    }

    setErrorMessage('');

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      price: priceValue,
      quantity: quantityValue,
      total: parseFloat(total),
      userAddress: address,
      listedAt: new Date(),
    };

    onNewOrder(newOrder);
  };

  const updateTotal = () => {
    if (price && quantity) {
      const totalValue = parseFloat(price) * parseFloat(quantity);
      setTotal(totalValue.toFixed(2));
    } else {
      setTotal('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Add {isBuyOrder ? 'Buy' : 'Sell'} Order
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (USDC)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                updateTotal();
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
              min={isDeveloperMode ? "0" : "0.01"}
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity (GLW)
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                updateTotal();
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
              min={isDeveloperMode ? "0" : "0.01"}
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="total" className="block text-sm font-medium text-gray-700">
              Total (USDC)
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{total ? `$${total}` : '-'}</p>
          </div>
          {errorMessage && (
            <div className="text-red-500 text-sm flex items-center mt-2">
              <AlertCircle size={16} className="mr-1" />
              {errorMessage}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListingPopup;