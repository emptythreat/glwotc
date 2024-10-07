import React, { useState, useCallback, useMemo } from 'react';
import { Order } from '../types';
import { Plus, X } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import BuySellPopup from './BuySellPopup';
import AddListingSlideOut from './AddListingSlideOut';

interface OrderBookProps {
  title: string;
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
  isBuyOrder: boolean;
  highlightedOrderId: string | null;
  onNewOrder: (order: Order, isBuyOrder: boolean) => void;
}

type SortField = 'listedAt' | 'price' | 'quantity' | 'total';
type SortDirection = 'asc' | 'desc';

const OrderBook: React.FC<OrderBookProps> = ({ title, orders, onCancelOrder, isBuyOrder, highlightedOrderId, onNewOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const { address, isConnected, connectWallet } = useWallet();
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>(isBuyOrder ? 'desc' : 'asc');

  const formatUSDC = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleOrderClick = (order: Order) => {
    if (isConnected) {
      if (order.userAddress === address) {
        // If it's the user's own order, cancel it
        onCancelOrder(order.id);
      } else {
        setSelectedOrder(order);
      }
    } else {
      connectWallet();
    }
  };

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(isBuyOrder ? 'desc' : 'asc');
    }
  }, [sortField, sortDirection, isBuyOrder]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'listedAt':
          comparison = a.listedAt.getTime() - b.listedAt.getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [orders, sortField, sortDirection]);

  const formatListedTime = (listedAt: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - listedAt.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <div className="card relative">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="section-title">{title}</h2>
        {isConnected && (
          <button onClick={() => setIsAddListingOpen(true)} className="text-green-600 hover:text-green-800">
            <Plus size={20} />
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        {orders.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell cursor-pointer" onClick={() => handleSort('listedAt')}>
                  Listed
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('price')}>
                  Price (USDC)
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('quantity')}>
                  Quantity (GLW)
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('total')}>
                  Total (USDC)
                </th>
                <th className="table-cell"></th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`table-row group ${
                    order.userAddress === address ? 'bg-green-50' : ''
                  } ${
                    order.id === highlightedOrderId ? 'bg-yellow-100 transition-colors duration-1000' : ''
                  }`}
                >
                  <td className="table-cell">{formatListedTime(order.listedAt)}</td>
                  <td className="table-cell">{formatUSDC(order.price)}</td>
                  <td className="table-cell">{order.quantity.toFixed(2)}</td>
                  <td className="table-cell relative">
                    <span className="group-hover:invisible">{formatUSDC(order.total)}</span>
                    <button
                      onClick={() => handleOrderClick(order)}
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in-out ${
                        order.userAddress === address
                          ? 'bg-red-500 hover:bg-red-600'
                          : isBuyOrder
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                      } text-white font-semibold rounded flex flex-col items-center justify-center px-2 py-1`}
                    >
                      {order.userAddress === address ? (
                        'Cancel Order'
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm whitespace-nowrap">
                            {isBuyOrder ? 'Sell' : 'Buy'} {order.quantity.toFixed(2)}
                          </span>
                          <span className="text-xs sm:text-sm">GLW</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="table-cell">
                    {order.userAddress === address && (
                      <button
                        onClick={() => onCancelOrder(order.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No current {isBuyOrder ? 'buy' : 'sell'} orders available.
          </div>
        )}
      </div>
      {selectedOrder && (
        <BuySellPopup
          order={selectedOrder}
          isBuyOrder={!isBuyOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={onCancelOrder}
        />
      )}
      {isAddListingOpen && (
        <AddListingSlideOut
          isBuyOrder={isBuyOrder}
          onClose={() => setIsAddListingOpen(false)}
          onNewOrder={(order) => {
            onNewOrder(order, isBuyOrder);
            setIsAddListingOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default React.memo(OrderBook);