import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/public/LandingPage';
import ClientLayout from './layouts/ClientLayout';
import Dashboard from './pages/client/Dashboard';
import TransactionHistoryPage from './pages/client/transactions/TransactionHistory';
import DepositPage from './pages/client/deposit/DepositPage';
import PaymentDetailsPage from './pages/client/withdraw/payment-details/PaymentDetailsPage';
import Leaderboard from './pages/client/leaderboard/Leaderboard';
import SettingsPage from './pages/client/settings/SettingsPage';
import SupportPage from './pages/client/support/SupportPage';
import FaqPage from './pages/public/FaqPage';


const App = () =>{
  return (
    <>

      <Routes>
        {/* Public Routes - Wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/faq" element={<FaqPage />} />
          {/* Add more public pages here like <Route path="/about" element={<AboutPage />} /> */}
        </Route>

        {/* Future Client Routes - Will be wrapped in a ClientLayout/ProtectedRoute */} 
        <Route element={<ClientLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaction-history" element={<TransactionHistoryPage />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/payment-details" element={<PaymentDetailsPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={ <SupportPage />} />
        </Route>
      </Routes>
  
      
    </>
  )
}

export default App;
