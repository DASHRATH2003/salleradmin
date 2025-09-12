import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SellerRegister from './pages/SellerRegister'
import SellerLogin from './pages/SellerLogin'
import SellerDocuments from './pages/SellerDocuments'

import Dashboard from './pages/Dashboard'
import { SellerProvider } from './context/SellerContext'

const App = () => {

  return (
    <SellerProvider>
      <Router>
        <Routes>
          {/* Default Route - Redirect to Seller Registration */}
          <Route path="/" element={<Navigate to="/seller/register" replace />} />
          
          {/* Dashboard Route */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Seller Routes (No Sidebar/Header) */}
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/documents" element={<SellerDocuments />} />

        </Routes>
      </Router>
    </SellerProvider>
  )
}

export default App