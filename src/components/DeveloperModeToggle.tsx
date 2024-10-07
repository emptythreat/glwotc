import React, { useState } from 'react';
import { useDeveloperMode } from '../contexts/DeveloperModeContext';

const DeveloperModeToggle: React.FC = () => {
  const { isDeveloperMode, toggleDeveloperMode, clearSampleData, protocolFee, setProtocolFee } = useDeveloperMode();
  const [tempFee, setTempFee] = useState(protocolFee.toString());

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempFee(e.target.value);
  };

  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFee = parseFloat(tempFee);
    if (!isNaN(newFee) && newFee >= 0 && newFee <= 100) {
      setProtocolFee(newFee);
    } else {
      alert('Please enter a valid fee percentage between 0 and 100');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
      <button
        onClick={toggleDeveloperMode}
        className={`px-4 py-2 rounded-full text-sm font-semibold ${
          isDeveloperMode
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {isDeveloperMode ? 'Disable Developer Mode' : 'Enable Developer Mode'}
      </button>
      {isDeveloperMode && (
        <>
          <button
            onClick={clearSampleData}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Clear Sample Data
          </button>
          <form onSubmit={handleFeeSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={tempFee}
              onChange={handleFeeChange}
              className="w-20 px-2 py-1 text-sm border rounded"
              placeholder="Fee %"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600"
            >
              Set Fee
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default DeveloperModeToggle;