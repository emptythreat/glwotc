import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coins, ChevronDown } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ErrorMessage from './ErrorMessage';

const Header: React.FC = () => {
  const { isConnected, connectWallet, disconnectWallet, switchWallet, address } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleSwitchWallet = async () => {
    try {
      await switchWallet();
      setIsDropdownOpen(false);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to switch wallet. Please try again.');
      }
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Coins size={24} className="text-green-600" />
          <h1 className="text-xl font-bold text-gray-800">Glow Market</h1>
        </div>
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="btn btn-primary text-sm flex items-center"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
                <ChevronDown size={16} className="ml-1" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Glow Market
                  </Link>
                  <Link
                    to="/activity"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Activity
                  </Link>
                  <button
                    onClick={handleSwitchWallet}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Switch Wallet
                  </button>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="btn btn-primary text-sm"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="container mx-auto px-4 py-2">
          <ErrorMessage message={error} />
        </div>
      )}
    </header>
  );
};

export default Header;