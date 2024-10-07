import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useDeveloperMode } from '../contexts/DeveloperModeContext';
import { Order } from '../types';
import { ethers } from 'ethers';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { CONFIG, GLW_TOKEN_ABI } from '../config';

interface SlideOutConfirmationProps {
  order: Order;
  isBuyOrder: boolean;
  onClose: () => void;
  onCancel: (orderId: string) => void;
}

const SlideOutConfirmation: React.FC<SlideOutConfirmationProps> = ({ order, isBuyOrder, onClose, onCancel }) => {
  const { address, provider } = useWallet();
  const { isDeveloperMode, protocolFee } = useDeveloperMode();
  const [hasBalance, setHasBalance] = useState(false);
  const [hasAllowance, setHasAllowance] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkBalanceAndAllowance();
  }, [order, address]);

  const checkBalanceAndAllowance = async () => {
    if (!address || !provider) return;

    try {
      const signer = provider.getSigner();
      const glwToken = new ethers.Contract(CONFIG.GLW_TOKEN_ADDRESS, GLW_TOKEN_ABI, signer);

      const balance = await glwToken.balanceOf(address);
      const allowance = await glwToken.allowance(address, order.userAddress);

      const requiredAmount = ethers.utils.parseUnits(order.quantity.toString(), 18);

      setHasBalance(balance.gte(requiredAmount));
      setHasAllowance(allowance.gte(requiredAmount));
    } catch (error) {
      console.error('Error checking balance and allowance:', error);
      setHasBalance(false);
      setHasAllowance(false);
    }
  };

  const handleApprove = async () => {
    if (!address || !provider) return;

    setIsApproving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const signer = provider.getSigner();
      const glwToken = new ethers.Contract(CONFIG.GLW_TOKEN_ADDRESS, GLW_TOKEN_ABI, signer);

      const amount = ethers.utils.parseUnits(order.quantity.toString(), 18);
      const tx = await glwToken.approve(order.userAddress, amount);
      await tx.wait();

      setHasAllowance(true);
      setSuccessMessage('Tokens approved successfully!');
    } catch (error) {
      console.error('Error approving tokens:', error);
      setErrorMessage('Failed to approve tokens. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirm = async () => {
    if (!address || !provider) return;

    setIsExecuting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const signer = provider.getSigner();
      const glwToken = new ethers.Contract(CONFIG.GLW_TOKEN_ADDRESS, GLW_TOKEN_ABI, signer);

      const amount = ethers.utils.parseUnits(order.quantity.toString(), 18);
      let tx;
      if (isBuyOrder) {
        tx = await glwToken.transfer(order.userAddress, amount);
      } else {
        tx = await glwToken.transferFrom(order.userAddress, address, amount);
      }
      await tx.wait();

      setSuccessMessage('Transaction executed successfully!');
      setTimeout(() => {
        onClose();
        onCancel(order.id); // Remove the executed order from the order book
      }, 2000);
    } catch (error) {
      console.error('Error executing transaction:', error);
      setErrorMessage('Failed to execute transaction. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isBuyOrder ? 'Buy' : 'Sell'} Order Confirmation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-6">
          <p className="mb-2">
            <span className="font-semibold">Price:</span> ${order.price.toFixed(2)} USDC
          </p>
          <p className="mb-2">
            <span className="font-semibold">Quantity:</span> {order.quantity.toFixed(2)} GLW
          </p>
          <p className="mb-2">
            <span className="font-semibold">Total:</span> ${order.total.toFixed(2)} USDC
          </p>
          {isDeveloperMode && (
            <p className="mb-2">
              <span className="font-semibold">Protocol Fee:</span> {(protocolFee * 100).toFixed(2)}%
            </p>
          )}
        </div>
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded flex items-center">
            <CheckCircle size={20} className="mr-2" />
            {successMessage}
          </div>
        )}
        <div className="flex flex-col space-y-2">
          {!hasAllowance && (
            <button
              onClick={handleApprove}
              disabled={isApproving || isExecuting}
              className={`w-full px-4 py-2 rounded ${
                isApproving || isExecuting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isApproving ? 'Approving...' : 'Approve Tokens'}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!hasAllowance || !hasBalance || isExecuting}
            className={`w-full px-4 py-2 rounded ${
              !hasAllowance || !hasBalance || isExecuting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isExecuting ? 'Executing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideOutConfirmation;