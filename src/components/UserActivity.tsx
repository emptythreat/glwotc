import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Activity } from '../types';
import { fetchUserActivity } from '../mockApi';
import { ExternalLink, Download } from 'lucide-react';

const UserActivity: React.FC = () => {
  const { address, isConnected } = useWallet();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadUserActivity();
    }
  }, [isConnected, address]);

  const loadUserActivity = async () => {
    setIsLoading(true);
    try {
      const userActivities = await fetchUserActivity(address!);
      setActivities(userActivities);
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Price', 'Quantity', 'Total', 'Timestamp', 'Transaction Hash'];
    const csvContent = [
      headers.join(','),
      ...activities.map(activity => 
        [
          activity.type,
          activity.order.price,
          activity.order.quantity,
          activity.order.total,
          activity.timestamp.toISOString(),
          activity.txHash
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'user_activity.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatUSDC = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">User Activity</h2>
        <p>Please connect your wallet to view your activity.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">User Activity</h2>
        <p>Loading your activity...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Activity</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          <Download size={18} className="mr-2" />
          Export to CSV
        </button>
      </div>
      {activities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Type</th>
                <th className="py-3 px-6 text-left">Price</th>
                <th className="py-3 px-6 text-left">Quantity</th>
                <th className="py-3 px-6 text-left">Total</th>
                <th className="py-3 px-6 text-left">Timestamp</th>
                <th className="py-3 px-6 text-left">Transaction</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {activities.map((activity, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <span className={`font-medium ${activity.type === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.type}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">{formatUSDC(activity.order.price)}</td>
                  <td className="py-3 px-6 text-left">{activity.order.quantity.toFixed(2)} GLW</td>
                  <td className="py-3 px-6 text-left">{formatUSDC(activity.order.total)}</td>
                  <td className="py-3 px-6 text-left">{activity.timestamp.toLocaleString()}</td>
                  <td className="py-3 px-6 text-left">
                    <a
                      href={`https://etherscan.io/tx/${activity.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No activity found for your account.</p>
      )}
    </div>
  );
};

export default UserActivity;