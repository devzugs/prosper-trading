import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/public/LandingPage';
import ClientLayout from './layouts/ClientLayout';
import Dashboard from './pages/client/Dashboard';
import TransactionHistoryPage from './pages/client/transactions/TransactionHistory';


const App = () =>{
  return (
    <>

      <Routes>
        {/* Public Routes - Wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          {/* Add more public pages here like <Route path="/about" element={<AboutPage />} /> */}
        </Route>

        {/* Future Client Routes - Will be wrapped in a ClientLayout/ProtectedRoute */} 
        <Route element={<ClientLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaction-history" element={<TransactionHistoryPage />} />
        </Route>
      </Routes>
  
      
    </>
  )
}

export default App;
