import React, { useState } from 'react'
import { Package, ShoppingCart, Menu, X, Plus, Upload, LogOut, User, Bot } from 'lucide-react'
import AddProduct from './AddProduct'
import SellerProducts from './SellerProducts'
import OrderDetails from './OrderDetails'
import JsonBulkUpload from './JsonBulkUpload'
import PythonAutomation from './PythonAutomation'
import { useSeller } from '../context/SellerContext'

const Dashboard = () => {
  const { seller } = useSeller()
  const [activeSection, setActiveSection] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(true)




  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'orders', label: 'Order Details', icon: ShoppingCart },
    { id: 'add-product', label: 'Add Products', icon: Plus },
    { id: 'bulk-upload', label: 'JSON Bulk Upload', icon: Upload },
    { id: 'automation', label: 'Python Automation', icon: Bot }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Seller Profile</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Manage your seller account information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Seller ID</label>
                      <input 
                        type="text" 
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Your unique seller ID"
                        value={seller?.id || seller?.sellerId || 'SELLER001'}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Store Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter your store name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Business Address</label>
                      <textarea 
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 sm:h-24 resize-none text-sm sm:text-base"
                        placeholder="Enter your business address"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">GST Number</label>
                      <input 
                        type="text" 
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter your GST number"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base">
                    Cancel
                  </button>
                  <button className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'products':
        return <SellerProducts />
      case 'orders':
        return <OrderDetails />
      case 'add-product':
        return <AddProduct />
      case 'bulk-upload':
        return <JsonBulkUpload />
      case 'automation':
        return <PythonAutomation />

      default:
        return null
    }
  }

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('seller')
    // Redirect to seller login page
    window.location.href = '/seller/login'
  }

  return (
    <div className="flex h-screen bg-gray-900 relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`${
        sidebarOpen 
          ? 'translate-x-0' 
          : '-translate-x-full lg:translate-x-0'
      } ${sidebarOpen ? 'w-64' : 'lg:w-16'} fixed lg:relative z-50 lg:z-auto bg-slate-800 shadow-xl transition-all duration-300 flex flex-col border-r border-gray-700 h-full`}>
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            {(sidebarOpen || window.innerWidth >= 1024) && (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                  <Package className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Baap Store</h2>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-500 transition-colors text-white lg:hidden"
            >
              {sidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>



        {/* Sidebar Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
                className={`w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 group ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-white hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                  activeSection === item.id ? 'text-white' : 'text-white group-hover:text-white'
                }`} />
                {(sidebarOpen || window.innerWidth >= 1024) && (
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 sm:p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-red-400 hover:bg-slate-700 hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-red-400 group-hover:text-red-300" />
            {(sidebarOpen || window.innerWidth >= 1024) && (
              <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        {/* Top Header */}
        <div className="bg-gray-800 shadow-sm border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">
                  {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Welcome back, {seller?.name || seller?.email || 'Seller'}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
               <div className="hidden sm:flex items-center space-x-3 bg-gray-700 px-3 sm:px-4 py-2 rounded-lg">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-xs sm:text-sm font-medium text-green-400">Online</span>
                 <div className="w-px h-4 bg-gray-500 mx-2"></div>
                 <div className="flex items-center space-x-2">
                   <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                   <span className="text-xs sm:text-sm font-medium text-gray-200 truncate max-w-[120px] sm:max-w-none">{seller?.email || seller?.name || 'seller@namah.com'}</span>
                 </div>
               </div>
               <div className="sm:hidden flex items-center space-x-2 bg-gray-700 px-2 py-1.5 rounded-lg">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <User className="w-4 h-4 text-gray-300" />
               </div>
             </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-3 sm:p-6 bg-gray-900">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default Dashboard