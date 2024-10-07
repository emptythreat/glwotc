import React from 'react';
import { Activity } from '../types';

interface ActivityLogProps {
  activities: Activity[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  const formatUSDC = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="card">
      <h2 className="section-title p-4 border-b border-gray-200">Activity</h2>
      <div className="p-4">
        {activities.length > 0 ? (
          <ul className="space-y-2">
            {activities.map((activity, index) => (
              <li key={index} className="text-sm">
                <span className={`font-semibold ${activity.type === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>
                  {activity.type}
                </span>{' '}
                {activity.order.quantity.toFixed(2)} GLW @ {formatUSDC(activity.order.price)} USDC
                <span className="text-gray-500 ml-2 text-xs">
                  {activity.timestamp.toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ActivityLog);