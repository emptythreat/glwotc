import React, { createContext, useState, useContext } from 'react';

interface DeveloperModeContextType {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => void;
  clearSampleData: () => void;
  protocolFee: number;
  setProtocolFee: (fee: number) => void;
}

const DeveloperModeContext = createContext<DeveloperModeContextType | undefined>(undefined);

export const DeveloperModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [protocolFee, setProtocolFee] = useState(0.1); // Default 0.1%

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
  };

  const clearSampleData = () => {
    window.dispatchEvent(new CustomEvent('clearSampleData'));
  };

  return (
    <DeveloperModeContext.Provider value={{ 
      isDeveloperMode, 
      toggleDeveloperMode, 
      clearSampleData, 
      protocolFee, 
      setProtocolFee 
    }}>
      {children}
    </DeveloperModeContext.Provider>
  );
};

export const useDeveloperMode = () => {
  const context = useContext(DeveloperModeContext);
  if (context === undefined) {
    throw new Error('useDeveloperMode must be used within a DeveloperModeProvider');
  }
  return context;
};