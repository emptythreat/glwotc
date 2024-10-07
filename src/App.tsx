import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import MainContent from './components/MainContent';
import AddListing from './components/AddListing';
import UserActivity from './components/UserActivity';
import { WalletProvider } from './contexts/WalletContext';
import { DeveloperModeProvider } from './contexts/DeveloperModeContext';
import DeveloperModeToggle from './components/DeveloperModeToggle';

function App() {
  const handleNewOrder = (order: any, isBuyOrder: boolean) => {
    // This function will be implemented in MainContent
    // It's here as a placeholder to pass down to AddListing
  };

  return (
    <WalletProvider>
      <DeveloperModeProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Header />
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route 
                path="/add-listing/:type" 
                element={<AddListing onNewOrder={handleNewOrder} />} 
              />
              <Route path="/activity" element={<UserActivity />} />
            </Routes>
            <DeveloperModeToggle />
          </div>
        </Router>
      </DeveloperModeProvider>
    </WalletProvider>
  );
}

export default App;