export interface Order {
  id: string;
  price: number;
  quantity: number;
  total: number;
  userAddress: string;
  listedAt: Date;
}

export interface Activity {
  type: 'Buy' | 'Sell' | 'Execute' | 'Cancel';
  order: Order;
  timestamp: Date;
  txHash: string; // Add this line
}