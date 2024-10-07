import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Order } from '../types';
import { ethers } from 'ethers';

const GLW_TOKEN_ADDRESS = "0xf4fbc617a5733eaaf9af08e1ab816b103388d8b6";
const USDC_TOKEN_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Mainnet USDC address
const EXCHANGE_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with your exchange contract address

const TransactionConfirmation: React.FC = () => {
  const { orderId, orderType } = useParams<{ orderId: string; orderType: string }>();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const [order, setOrder] = useState<Order | null>(null);
  const [hasBalance, setHasBalance] = useState(false);
  const [hasAllowance, setHasAllowance] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    // Simulated fetch of order details
    // In a real app, you'd fetch this from your state or API
    setOrder({
      id: orderId || '',
      price: 100,
      quantity: 10,
      total: 1000,
    });

    // Check balance and allowance
    checkBalanceAndAllowance();
  }, [orderId, orderType, address]);

  const checkBalanceAndAllowance = async () => {
    if (!address || !order) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenAddress = orderType === 'buy' ? GLW_TOKEN_ADDRESS : USDC_TOKEN_ADDRESS;
      const token = new ethers.Contract(tokenAddress, [
        "function balanceOf(address account) public view returns (uint256)",
        "function allowance(address owner, address spender) public view returns (uint256)"
      ], provider);

      const balance = await token.balanceOf(address);
      const allowance = await token.allowance(address, EXCHANGE_ADDRESS);

      const requiredAmount = ethers.utils.parseUnits(
        orderType === 'buy' ? order.quantity.toString() : order.total.toString(),
        orderType === 'buy' ? 18 : 6 // GLW has 18 decimals, USDC has 6
      );

      setHasBalance(balance.gte(requiredAmount));
      setHasAllowance(allowance.gte(requiredAmount));
    } catch (error) {
      console.error('Error checking balance and allowance:', error);
      setHasBalance(false);
      setHasAllowance(false);
    }
  };

  const handleApprove = async () => {
    if (!order || !address) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenAddress = orderType === 'buy' ? GLW_TOKEN_ADDRESS : USDC_TOKEN_ADDRESS;
      const token = new ethers.Contract(tokenAddress, ["function approve(address spender, uint256 amount) public returns (bool)"], signer);

      const amount = ethers.utils.parseUnits(
        orderType === 'buy' ? order.quantity.toString() : order.total.toString(),
        orderType === 'buy' ? 18 : 6 // GLW has 18 decimals, USDC has 6
      );

      const tx = await token.approve(EXCHANGE_ADDRESS, amount);
      await tx.wait();

      alert('Token approval successful!');
      setHasAllowance(true);
    } catch (error) {
      console.error('Error approving tokens:', error);
      alert('Failed to approve tokens. Please try again.');
    }
  };

  const handleConfirm = async () => {
    if (!order || !address) return;

    setIsExecuting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tokenAddress = orderType === 'buy' ? GLW_TOKEN_ADDRESS : USDC_TOKEN_ADDRESS;
      const token = new ethers.Contract(tokenAddress, ["function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)"], signer);

      const amount = ethers.utils.parseUnits(
        orderType === 'buy' ? order.quantity.toString() : order.total.toString(),
        orderType === 'buy' ? 18 : 6 // GLW has 18 decimals, USDC has 6
      );

      const tx = await token.transferFrom(address, EXCHANGE_ADDRESS, amount);
      await tx.wait();

      alert('Transaction successful!');
      navigate('/');
    } catch (error) {
      console.error('Error executing transaction:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  const formatUSDC = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!order) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 p-4 border-b border-gray-200">
          Confirm {orderType === 'buy' ? 'Sale' : 'Purchase'}
        </h2>
        <div className="p-4">
          <div className="mb-4">
            <p>Price: {formatUSDC(order.price)} USDC</p>
            <p>Quantity: {order.quantity} GLW</p>
            <p>Total: {formatUSDC(order.total)} USDC</p>
          </div>
          {!hasBalance && (
            <div className="text-red-500 mb-4">
              Insufficient {orderType === 'buy' ? 'GLW' : 'USDC'} balance to complete this transaction.
            </div>
          )}
          {!hasAllowance && hasBalance && (
            <div className="text-yellow-500 mb-4">
              You need to approve the tokens before proceeding.
            </div>
          )}
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/')}
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>
            {!hasAllowance && hasBalance ? (
              <button
                onClick={handleApprove}
                disabled={!hasBalance || isExecuting}
                className={`btn ${hasBalance && !isExecuting ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Approve Tokens
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!hasBalance || !hasAllowance || isExecuting}
                className={`btn ${hasBalance && hasAllowance && !isExecuting ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {isExecuting ? 'Processing...' : `Confirm ${orderType === 'buy' ? 'Sale' : 'Purchase'}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmation;