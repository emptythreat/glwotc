import React from 'react';
import { Order } from '../types';

interface MarketStatisticsProps {
  lowestSellOrder: Order | null;
  highestBuyOrder: Order | null;
  lastExchangedPrice: number | null;
  totalVolume24h: number;
}

const MarketStatistics: React.FC<MarketStatisticsProps> = ({
  lowestSellOrder,
  highestBuyOrder,
  lastExchangedPrice,
  totalVolume24h
}) => {
  const formatUSDC = (value: number | null) => {
    if (value === null) return 'N/A';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatGLW = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GLW`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Lowest Sell Order</h3>
        <p className="text-xl font-bold text-gray-800">{formatUSDC(lowestSellOrder?.price || null)}</p>
        <p className="text-sm text-gray-500">{formatGLW(lowestSellOrder?.quantity || null)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Highest Buy Order</h3>
        <p className="text-xl font-bold text-gray-800">{formatUSDC(highestBuyOrder?.price || null)}</p>
        <p className="text-sm text-gray-500">{formatGLW(highestBuyOrder?.quantity || null)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Last Exchanged Price</h3>
        <p className="text-xl font-bold text-gray-800">{formatUSDC(lastExchangedPrice)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">24h Volume</h3>
        <p className="text-xl font-bold text-gray-800">{formatUSDC(totalVolume24h)}</p>
      </div>
    </div>
  );
};

export default MarketStatistics;