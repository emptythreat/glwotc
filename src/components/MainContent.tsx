import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import OrderBook from './OrderBook';
import ActivityLog from './ActivityLog';
import ErrorMessage from './ErrorMessage';
import MarketStatistics from './MarketStatistics';
import { Order, Activity } from '../types';
import { fetchInitialData } from '../mockApi';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useDeveloperMode } from '../contexts/DeveloperModeContext';

function MainContent() {
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const { isConnected } = useWallet();
  const { isDeveloperMode } = useDeveloperMode();

  const location = useLocation();

  const lowestSellOrder = sellOrders.length > 0 ? sellOrders[0] : null;
  const highestBuyOrder = buyOrders.length > 0 ? buyOrders[0] : null;
  const lastExchangedPrice = activities.length > 0 ? activities[0].order.price : null;
  const totalVolume24h = activities
    .filter(a => new Date().getTime() - a.timestamp.getTime() <= 24 * 60 * 60 * 1000)
    .reduce((sum, a) => sum + a.order.total, 0);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await fetchInitialData();
      setSellOrders(data.sellOrders);
      setBuyOrders(data.buyOrders);
      setActivities(data.activities);
      setLastUpdateTime(new Date());
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newOrderId = params.get('newOrderId');
    if (newOrderId) {
      setHighlightedOrderId(newOrderId);
      setSuccessMessage('New order added successfully!');
      setTimeout(() => {
        setHighlightedOrderId(null);
        setSuccessMessage(null);
      }, 5000);
    }
  }, [location]);

  const handleRefresh = async () => {
    await fetchData();
  };

  const handleCancelOrder = async (orderId: string, isBuyOrder: boolean) => {
    // Implement order cancellation logic here
    console.log(`Cancelling ${isBuyOrder ? 'buy' : 'sell'} order: ${orderId}`);
    // After successful cancellation, refresh the data
    await fetchData();
    setSuccessMessage('Order cancelled successfully!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleNewOrder = (order: Order, isBuyOrder: boolean) => {
    if (isBuyOrder) {
      setBuyOrders([...buyOrders, order]);
    } else {
      setSellOrders([...sellOrders, order]);
    }
    setHighlightedOrderId(order.id);
    setSuccessMessage('New order added successfully!');
    setTimeout(() => {
      setHighlightedOrderId(null);
      setSuccessMessage(null);
    }, 5000);
  };

  const handleExecuteOrder = async (orderId: string, isBuyOrder: boolean) => {
    // Simulate order execution
    console.log(`Executing ${isBuyOrder ? 'buy' : 'sell'} order: ${orderId}`);
    // Remove the executed order from the order book
    if (isBuyOrder) {
      setBuyOrders(buyOrders.filter(order => order.id !== orderId));
    } else {
      setSellOrders(sellOrders.filter(order => order.id !== orderId));
    }
    // Add a new activity for the executed order
    const executedOrder = isBuyOrder
      ? buyOrders.find(order => order.id === orderId)
      : sellOrders.find(order => order.id === orderId);
    if (executedOrder) {
      const newActivity: Activity = {
        type: isBuyOrder ? 'Buy' : 'Sell',
        order: executedOrder,
        timestamp: new Date(),
      };
      setActivities([newActivity, ...activities]);
    }
    setSuccessMessage('Order executed successfully!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const getTimeSinceLastUpdate = () => {
    const now = new Date();
    const diffInMinutes = Math.round((now.getTime() - lastUpdateTime.getTime()) / 60000);
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {successMessage && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <MarketStatistics
        lowestSellOrder={lowestSellOrder}
        highestBuyOrder={highestBuyOrder}
        lastExchangedPrice={lastExchangedPrice}
        totalVolume24h={totalVolume24h}
      />
      <div className="flex items-center justify-end mb-2 text-xs text-gray-500">
        <span className="mr-1">
          Last updated {getTimeSinceLastUpdate()} ago
        </span>
        {isRefreshing ? (
          <Loader2 className="animate-spin h-3 w-3 text-blue-500" />
        ) : (
          <RefreshCw
            className="h-3 w-3 text-blue-500 cursor-pointer hover:text-blue-600"
            onClick={handleRefresh}
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <OrderBook
          title="Sell Orders"
          orders={sellOrders}
          onCancelOrder={(orderId) => handleCancelOrder(orderId, false)}
          onExecuteOrder={(orderId) => handleExecuteOrder(orderId, false)}
          isBuyOrder={false}
          highlightedOrderId={highlightedOrderId}
          onNewOrder={handleNewOrder}
        />
        <OrderBook
          title="Buy Orders"
          orders={buyOrders}
          onCancelOrder={(orderId) => handleCancelOrder(orderId, true)}
          onExecuteOrder={(orderId) => handleExecuteOrder(orderId, true)}
          isBuyOrder={true}
          highlightedOrderId={highlightedOrderId}
          onNewOrder={handleNewOrder}
        />
        <ActivityLog activities={activities} />
      </div>
      {isDeveloperMode && (
        <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Developer Mode Active</h3>
          <p>Protocol Fee: {(useDeveloperMode().protocolFee * 100).toFixed(2)}%</p>
        </div>
      )}
    </main>
  );
}

export default MainContent;