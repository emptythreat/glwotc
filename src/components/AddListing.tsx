import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useDeveloperMode } from '../contexts/DeveloperModeContext';
import { ArrowRight, AlertCircle, X } from 'lucide-react';

interface AddListingProps {
  onNewOrder: (order: any, isBuyOrder: boolean) => void;
}

const AddListing: React.FC<AddListingProps> = ({ onNewOrder }) => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const { isDeveloperMode } = useDeveloperMode();
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    if (price && quantity) {
      const totalValue = parseFloat(price) * parseFloat(quantity);
      setTotal(totalValue.toFixed(2));
    } else {
      setTotal('');
    }
  }, [price, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const priceValue = parseFloat(price);
    const quantityValue = parseFloat(quantity);

    if (!isDeveloperMode && (priceValue <= 0 || quantityValue <= 0)) {
      setErrorMessage('Price and quantity must be greater than 0.');
      return;
    }

    setErrorMessage('');
    setIsApproving(true);

    try {
      // Simulating blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newOrder = {
        id: `order-${Date.now()}`,
        price: priceValue,
        quantity: quantityValue,
        total: parseFloat(total),
        userAddress: address,
        listedAt: new Date(),
      };

      onNewOrder(newOrder, type === 'buy');
      navigate(`/?newOrderId=${newOrder.id}`);
    } catch (error) {
      console.error('Error adding new order:', error);
      setErrorMessage('Failed to add new order. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 pt-16">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Add {type === 'buy' ? 'Buy' : 'Sell'} Order
          </h2>
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (USDC)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
              onChange={(e) => setQuantity(e.target.value)}
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
          <div className="flex justify-between space-x-4">
            <Link
              to="/"
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
              disabled={isApproving}
            >
              {isApproving ? (
                'Approving...'
              ) : (
                <>
                  Add Order
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>
          </div>
          {errorMessage && (
            <div className="text-red-500 text-sm flex items-center justify-center mt-2">
              <AlertCircle size={16} className="mr-1" />
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddListing;