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
import MarketsPage from './pages/client/markets/MarketsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage.';
import ReferralPage from './pages/client/referral/ReferralPage';
import WithdrawPage from './pages/client/withdraw/withdrawal/WithdrawPage';
import LoginPage from './pages/public/auth/LoginPage';
import SignupPage from './pages/public/auth/SignupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/Adminroute';
import AdminLayout from './layouts/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminAuditLog from './pages/admin/AdminAuditLog';
import ForgotPasswordPage from './pages/public/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/auth/ResetPasswordPage';


const App = () =>{
  return (
    <>

      <Routes>
        {/* Public Routes - Wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          {/* Add more public pages here like <Route path="/about" element={<AboutPage />} /> */}
        </Route>

        {/* Auth Routes - intentionally outside PublicLayout/ClientLayout (own minimal layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Client Routes - gated by ProtectedRoute, then wrapped in ClientLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ClientLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transaction-history" element={<TransactionHistoryPage />} />
            <Route path="referral" element={<ReferralPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/payment-details" element={<PaymentDetailsPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={ <SupportPage />} />
            <Route path="/markets" element={<MarketsPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="referrals" element={<AdminReferrals />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
          </Route>
        </Route>
      </Routes>
  
      
    </>
  )
}

export default App;