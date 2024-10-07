import { Order, Activity } from './types';

const generateMockOrders = (count: number): Order[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `order-${i + 1}`,
    price: Math.random() * 10 + 0.5,
    quantity: Math.floor(Math.random() * 100) + 1,
    total: 0,
    userAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
    listedAt: new Date(Date.now() - Math.random() * 86400000), // Random time within the last 24 hours
  })).map(order => ({
    ...order,
    total: Number((order.price * order.quantity).toFixed(2)),
  }));
};

const generateMockActivities = (count: number): Activity[] => {
  const types: ('Buy' | 'Sell' | 'Execute' | 'Cancel')[] = ['Buy', 'Sell', 'Execute', 'Cancel'];
  return Array.from({ length: count }, (_, i) => ({
    type: types[Math.floor(Math.random() * types.length)],
    order: generateMockOrders(1)[0],
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
    txHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Add this line
  }));
};

export const fetchInitialData = async (): Promise<{
  sellOrders: Order[];
  buyOrders: Order[];
  activities: Activity[];
}> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const sellOrders = generateMockOrders(10);
    const buyOrders = generateMockOrders(10);
    const activities = generateMockActivities(20);
    return { sellOrders, buyOrders, activities };
  } catch (error) {
    console.error('Error in fetchInitialData:', error);
    throw new Error('Failed to fetch initial data. Please try again later.');
  }
};

export const fetchUserActivity = async (address: string): Promise<Activity[]> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const activities = generateMockActivities(10).map(activity => ({
      ...activity,
      order: { ...activity.order, userAddress: address },
    }));
    return activities;
  } catch (error) {
    console.error('Error in fetchUserActivity:', error);
    throw new Error('Failed to fetch user activity. Please try again later.');
  }
};